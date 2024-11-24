# uber-lite-backend

## Functional Features

### Core
- The user should be able to choose the payment method.
- The rider should be able to define a destination for the trip and have a fare estimation from Uber side.
- The rider should be able to confirm the trip with the defined destination and fare.
- The rider should be matched with the nearest drivers.
- The driver should be notified by ride request with the ability to accept/deny within defined time 10s.
- The location of the driver should be tracked while he is in work state, which is the cornerstone of the matching process.

### Secondary
- The rider can have the ability to choose the type of vehicle that suits him / The driver can have the ability to class his vehicle(s).
- The rider/driver can have the ability to rate the driver/rider, and that rate can take place in internal implementation.
- The driver should receive/handle one trip at a time, no multiple rides simultaneously.

## Non-Functional Features

### Core
- The matching between the rider and the nearest driver should be efficient and fast.
- The location updates should be handled in a manner that guarantees useful and quick writes.

## Entities

### Rider
- `id`
- `name`
- `status`

### Driver
- `id`
- `name`

### Ride
- `id`
- `fare_id`
- `rider_id`
- `driver_id`
- `source`
- `destination`

### Fare
- `id`
- `ride_id`
- `fare_estimation`

### Location
- `driver_id`
- `longitude`
- `latitude`

## APIs

### Get Fare Estimation
- **Endpoint**: `/fare`
- **Method**: POST
- **Request Body**:
  ```json
  {
      "source": "<source_location>",
      "destination": "<destination_location>"
  }
  ```

### Confirm the Ride
- **Endpoint**: `/rides`
- **Method**: POST
- **Request Body**:
  ```json
  {
      "fareId": "<fare_id>"
  }
  ```

### Accept/Deny a Ride Request
- **Endpoint**: `/rides/{rideId}`
- **Method**: PUT | PATCH
- **Request Body**:
  ```json
  {
      "response": "accept" | "deny"
  }
  ```

### Update Driver Location
- **Endpoint**: `/drivers/location`
- **Method**: POST
- **Request Body**:
  ```json
  {
      "longitude": "<driver_longitude>",
      "latitude": "<driver_latitude>"
  }
  ```

---

### Key Questions and Focus Areas

#### **How can we manage system overload from frequent driver location updates while ensuring location accuracy?**

1. **High Write Operations:**
   - Location updates are core to the matching process and the success of the system.
   - With high writes per second due to frequent driver location updates, the process must be **fast and efficient**.
   - **Meaningful/Adaptive Updates**:
     - Update locations only when the driver is on work/available for ride requests.
     - Updates should be **adaptive** based on the driver's speed:
       - **High Speed**: Frequent updates at smaller time intervals to maintain accuracy.
       - **Low Speed**: Reduce update frequency to avoid unnecessary writes.
   - Consider how sensor data from devices (e.g., GPS, accelerometers) can help optimize update intervals.

---

#### **How do we handle efficient proximity searches on location data?**

1. **Low-Latency Matching Process:**
   - The matching process needs to be fast to retrieve drivers efficiently.

2. **Database Options for Proximity Searches:**
   - **Relational Database (Pure Approach):**
     - Requires a **full scan** of the driver location table for calculations.
     - Adding indexes can help but raises questions about:
       - Frequency of index updates.
       - Handling of geographical coordinates with index tree structures.
   - **Redis for Geospatial Data:**
     - Redis provides:
       - Tools for handling geographical coordinates.
       - Algorithms optimized for proximity searches and geospatial data.
       - High write speed to accommodate frequent updates.
     - Considerations for Redis:
       - Explore **durability** concerns. Reference: [Durable Redis](https://redis.io/technology/durable-redis/).

---