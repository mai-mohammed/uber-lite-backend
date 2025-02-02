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

4. **Starting the Ride**:
   - The driver should be able to mark when they've picked up the rider and started the journey.

5. **Handling the Ride**:
   - The driver should only be allowed to handle one ride at a time, avoiding conflicts from multiple requests.

6. **Completing the Ride**:
   - The driver should have the ability to mark the ride as completed and provide feedback about the rider.

---

### Summarized Functional Features

#### Core
- The rider can define a destination and confirm a trip with a fare estimation.
- The system should match the rider with the nearest driver efficiently.
- The driver should receive ride requests and be able to accept/deny within 10 seconds.
- The driver’s real-time location should be tracked and updated throughout the trip.
- Drivers should handle only one trip at a time, ensuring focus and efficiency.

#### Secondary
- Riders can select a vehicle type that suits their preferences, while drivers can classify their vehicles.
- Riders and drivers can provide feedback (ratings) after the trip.

---

## Non-Functional Features

### Core
- The system must ensure fast and accurate matching between riders and drivers, minimizing waiting times.
   - Efficient Driver Search: Quickly find the nearest available driver using real-time location data.  
   - Limit Driver Response Time: Ensure drivers respond to ride requests within a set time (e.g., 10 seconds) to avoid delays.
- Location data should be handled in a way that optimizes performance with quick, meaningful writes, such as adapting update frequency based on driver speed or proximity to the rider.


Here’s the updated **README** section with the requested structure:

---

## Entities

![Entities Diagram](./diagrams/entities.png)

### User
- `id`
- `name`
- `email`
- `password`
- `type`
- `status`

### Ride
- `id`
- `rider_id`
- `driver_id`
- `source_lat`
- `source_lng`
- `destination_lat`
- `destination_lng`
- `fare_amount`
- `status`
- `completed_at`
- `cancelled_at`
- `started_at`
- `created_at`

### DriverLocation (In-Memory)
- `driver_id`
- `latitude`
- `longitude`
- `timestamp`

### RideRequest (In-Memory)
- `ride_id`
- `driver_id`
- `status`
- `created_at`

## APIs

### User Management
- **Register User**
  - **Endpoint**: `/users/register`
  - **Method**: POST
  - **Request Body**:
    ```json
    {
        "name": "<user_name>",
        "email": "<user_email>",
        "password": "<user_password>",
        "type": "rider" | "driver"
    }
    ```

- **Login User**
  - **Endpoint**: `/users/login`
  - **Method**: POST
  - **Request Body**:
    ```json
    {
        "email": "<user_email>",
        "password": "<user_password>"
    }
    ```

- **Logout User**
  - **Endpoint**: `/users/logout`
  - **Method**: POST
  - **Auth**: Required

### Driver Operations
- **Update Driver Location**
  - **Endpoint**: `/drivers/:driverId/location`
  - **Method**: PUT
  - **Auth**: Required (Driver only)
  - **Request Body**:
    ```json
    {
        "longitude": "<driver_longitude>",
        "latitude": "<driver_latitude>"
    }
    ```

- **Update Driver Status**
  - **Endpoint**: `/drivers/:driverId/status`
  - **Method**: PUT
  - **Auth**: Required (Driver only)
  - **Request Body**:
    ```json
    {
        "status": "available" | "busy" | "offline"
    }
    ```

### Fare Operations
- **Get Fare Estimation**
  - **Endpoint**: `/fares`
  - **Method**: POST
  - **Auth**: Required
  - **Request Body**:
    ```json
    {
        "source": {
            "latitude": "<source_latitude>",
            "longitude": "<source_longitude>"
        },
        "destination": {
            "latitude": "<destination_latitude>",
            "longitude": "<destination_longitude>"
        }
    }
    ```

### Ride Operations
- **Confirm Ride**
  - **Endpoint**: `/rides/confirm`
  - **Method**: POST
  - **Auth**: Required (Rider only)
  - **Request Body**:
    ```json
    {
        "rideId": "<ride_id>"
    }
    ```

- **Start Ride**
  - **Endpoint**: `/rides/:rideId/start`
  - **Method**: POST
  - **Auth**: Required (Driver only)

- **Complete Ride**
  - **Endpoint**: `/rides/:rideId/complete`
  - **Method**: POST
  - **Auth**: Required (Driver only)

- **Cancel Ride**
  - **Endpoint**: `/rides/:rideId/cancel`
  - **Method**: POST
  - **Auth**: Required (Rider only)

- **Respond to Ride Request**
  - **Endpoint**: `/rides/:rideId/respond`
  - **Method**: PUT
  - **Auth**: Required (Driver only)
  - **Request Body**:
    ```json
    {
        "isAccepted": true | false
    }
    ```


### Authentication
- All protected routes require a Bearer token in the Authorization header
- Token is obtained from the login response
- Format: `Authorization: Bearer <token>`

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with Nodemon
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:services` - Run services tests
- `npm run test:routes` - Run routes tests
