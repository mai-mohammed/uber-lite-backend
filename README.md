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
