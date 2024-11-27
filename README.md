# uber-lite-backend

## Functional Features

### User Journeys and Requirements

#### **Rider Journey: Booking a Ride**
1. **Setting Up the Trip**:
   - The rider should be able to define a destination and get a fare estimation from Uber.
   - The rider should be able to choose a payment method for the trip.
   
2. **Confirming the Ride**:
   - The rider should be able to confirm the trip with the defined destination and fare.

3. **Waiting for Matching**:
   - The rider should be matched with the nearest available driver.
   - The driver should be notified of the ride request and have the ability to accept or deny it within 10 seconds.

4. **Tracking the Driver**:
   - The rider should be able to track the driver's real-time location until pickup and during the ride.

5. **Completing the Ride**:
   - The rider should have the ability to rate the driver after the trip.

#### **Driver Journey: Accepting and Completing a Ride**
1. **Setting Availability**:
   - The driver should be able to set their status to "available" to start receiving ride requests.

2. **Receiving Ride Requests**:
   - The driver should be notified of a ride request with relevant details (e.g., pickup location) and have the ability to accept or deny the request within 10 seconds.

3. **Providing Location Updates**:
   - The driver's location should be tracked in real time to enable efficient matching and rider tracking.

4. **Handling the Ride**:
   - The driver should only be allowed to handle one ride at a time, avoiding conflicts from multiple requests.

5. **Completing the Ride**:
   - The driver should have the ability to mark the ride as completed and provide feedback about the rider.

---

### Summarized Functional Features

#### Core
- The rider can define a destination, choose a payment method, and confirm a trip with a fare estimation.
- The system should match the rider with the nearest driver efficiently.
- The driver should receive ride requests and be able to accept/deny within 10 seconds.
- The driver’s real-time location should be tracked and updated throughout the trip.
- Riders and drivers can provide feedback (ratings) after the trip.

#### Secondary
- Riders can select a vehicle type that suits their preferences, while drivers can classify their vehicles.
- Drivers should handle only one trip at a time, ensuring focus and efficiency.

---

## Non-Functional Features

### Core
- **Efficiency**: The system must ensure fast and accurate matching between riders and drivers, minimizing waiting times.
- **Location Updates**: Location data should be handled in a way that optimizes performance with quick, meaningful writes, such as adapting update frequency based on driver speed or proximity to the rider.


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