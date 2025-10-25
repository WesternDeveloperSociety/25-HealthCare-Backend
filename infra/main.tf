provider "google" {
  project = var.project_id
  region  = var.region
}

# -----------------------------
# 1. VPC + Subnet
# -----------------------------
resource "google_compute_network" "main" {
  name                    = "main-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "private" {
  name          = "private-subnet"
  ip_cidr_range = "10.10.0.0/24"
  region        = var.region
  network       = google_compute_network.main.id
}

# -----------------------------
# 2. Private Service Connection (for Cloud SQL private IP)
# -----------------------------
resource "google_compute_global_address" "private_service_range" {
  name          = "google-managed-services"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.main.id
  service                 = "services/servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_service_range.name]
}

# -----------------------------
# 3. Secret Manager (DB password)
# -----------------------------
resource "google_secret_manager_secret" "db_pass" {
  secret_id = "db-password"
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "db_pass_version" {
  secret      = google_secret_manager_secret.db_pass.id
  secret_data = var.db_password
}

# -----------------------------
# 4. Cloud SQL (Private IP only)
# -----------------------------
resource "google_sql_database_instance" "main" {
  name             = "app-db"
  region           = var.region
  database_version = "POSTGRES_15"

  settings {
    tier = "db-f1-micro" # smallest, change as needed

    ip_configuration {
      ipv4_enabled    = false   # NO PUBLIC IP
      private_network = google_compute_network.main.id
      require_ssl     = true
    }
  }

  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]
}

resource "google_sql_database" "app" {
  name     = "appdb"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  name     = "appuser"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# -----------------------------
# 5. VPC Access Connector (Cloud Run → SQL)
# -----------------------------
resource "google_vpc_access_connector" "connector" {
  name   = "serverless-connector"
  region = var.region
  network = google_compute_network.main.name

  ip_cidr_range = "10.8.0.0/28"
}

# -----------------------------
# 6. Cloud Run Service
# -----------------------------
resource "google_cloud_run_v2_service" "app" {
  name     = "app-service"
  location = var.region

  template {
    containers {
      image = "gcr.io/${var.project_id}/app:latest"

      env {
        name = "DB_USER"
        value = google_sql_user.app.name
      }

      env {
        name = "DB_NAME"
        value = google_sql_database.app.name
      }

      env {
        name = "DB_PASS_SECRET"
        value = google_secret_manager_secret.db_pass.id
      }

      env {
        name = "DB_HOST"
        value = google_sql_database_instance.main.ip_addresses[0].ip_address
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.name
      egress    = "ALL_TRAFFIC"
    }
  }

  ingress = "INGRESS_TRAFFIC_ALL" # Keep simple unless you want to restrict

  depends_on = [
    google_vpc_access_connector.connector
  ]
}

# -----------------------------
# 7. Allow authenticated invocations only
# -----------------------------
resource "google_cloud_run_service_iam_binding" "no_unauth" {
  location = google_cloud_run_v2_service.app.location
  service  = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"

  members = [
    "allAuthenticatedUsers"
  ]
}
