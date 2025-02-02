# System Capacity Estimations

## Assumptions and Inputs

### User Base:
- **Total active users:** 1,000,000
- **Rider to driver ratio:** 80:20
- **Riders:** 800,000
- **Drivers:** 200,000

### Ride Frequency:
- **Average rides per user per day:** 2
- **Total rides per day:** 800,000 × 2 = 1,600,000
- **Average driver active hours:** 6 hours per day
- **Location update frequency:** Every 10 seconds

### Data Model and Field Sizes:

#### User:
<details>
<summary><strong>Total per user: ~184 bytes</strong></summary>

- **id:** 4 bytes (integer)
- **name:** 50 bytes (string)
- **email:** 50 bytes (string)
- **password:** 60 bytes (hashed string)
- **type:** 10 bytes (string)
- **status:** 10 bytes (string)
</details>

#### Ride:
<details>
<summary><strong>Total per ride: ~90 bytes</strong></summary>

- **id:** 4 bytes (integer)
- **rider_id:** 4 bytes (integer)
- **driver_id:** 4 bytes (integer)
- **source_lat:** 8 bytes (double)
- **source_lng:** 8 bytes (double)
- **destination_lat:** 8 bytes (double)
- **destination_lng:** 8 bytes (double)
- **fare_amount:** 8 bytes (double)
- **status:** 10 bytes (string)
- **completed_at:** 8 bytes (timestamp)
- **cancelled_at:** 8 bytes (timestamp)
- **started_at:** 8 bytes (timestamp)
- **created_at:** 8 bytes (timestamp)
</details>

#### DriverLocation (In-Memory):
<details>
<summary><strong>Total per location update: ~28 bytes</strong></summary>

- **driver_id:** 4 bytes (integer)
- **latitude:** 8 bytes (double)
- **longitude:** 8 bytes (double)
- **timestamp:** 8 bytes (timestamp)
</details>

#### RideRequest (In-Memory):
<details>
<summary><strong>Total per ride request: ~26 bytes</strong></summary>

- **ride_id:** 4 bytes (integer)
- **driver_id:** 4 bytes (integer)
- **status:** 10 bytes (string)
- **created_at:** 8 bytes (timestamp)
</details>

#### Payload Sizes (Actual JSON):
- **User registration:** ~135 bytes (including JSON overhead)
- **Ride request response:** ~19 bytes (including JSON overhead)
- **Location update:** ~32 bytes (including JSON overhead)
- **RideRequest response:** ~19 bytes (including JSON overhead)

## Capacity Planning

### Network

#### Total Requests per Day:
- **User-related requests** (login, logout, etc.): 1,000,000 × 2 × 135 bytes ≈ **270 MB**
- **Ride operations:**
  - Ride requests: 1,600,000 × 80 bytes ≈ **130 MB**
  - Ride responses: 1,600,000 × 19 bytes ≈ **31 MB**
  - Status updates (start, complete, cancel): 1,600,000 × 3 × 19 bytes ≈ **92 MB**
- **Location updates:** 
  - Active drivers: 200,000 drivers
  - Updates per driver: 6 hours × 3600 seconds ÷ 10 seconds = 2,160 updates per driver per day
  - Total daily updates: 200,000 × 2,160 × 32 bytes ≈ **14 GB**

#### Total Network Traffic:
- Base payload data: 270 MB + 130 MB + 31 MB + 92 MB + 14,000 MB ≈ **14,523 MB**
- With 20% headers overhead: 14,523 × 1.2 ≈ **17,428 MB**
- With 30% peak buffer: 17,428 × 1.3 ≈ **23 GB per day**

### Storage

#### User Data:
- **Total storage for users:** 1,000,000 × 184 bytes ≈ **184 MB**

#### Ride Data:
- **Total storage for rides per day:** 1,600,000 × 90 bytes ≈ **144 MB**
- **Assuming data retention for 30 days:** 144 MB × 30 ≈ **5 GB**

#### Location Data (In-Memory):
- **Total storage for location updates:** 200,000 × 2 × 28 bytes ≈ **12 MB**
- Two records per driver: current location and previous location only

#### RideRequest Data (In-Memory):
- **Total storage for ride requests per day:** 1,600,000 × 26 bytes ≈ **42 MB**
- **Assuming data retention for 1 day:** ≈ **42 MB**

## Machine Requirements and Conclusions

### Single Machine Specifications (256GB RAM, 4TB SSD, 8 CPU):

#### Resource Usage:
1. **RAM Requirements:**
   - In-Memory Data: (12 MB + 42 MB) × 3 (redundancy) ≈ 160 MB
   - Application Cache (estimated): 2 GB
   - Total RAM needed: ≈ **3 GB**

2. **Storage Requirements:**
   - Persistent Data: (184 MB + 5 GB) × 3 (replication) ≈ 16 GB
   - System and Logs: 20 GB
   - Total Storage needed: ≈ **36 GB**

3. **Network Requirements:**
   - Average throughput: 23 GB / 86400 seconds ≈ 260 KB/s
   - Peak throughput (5x average): ≈ 1.3 MB/s


---


A single machine could theoretically handle the load