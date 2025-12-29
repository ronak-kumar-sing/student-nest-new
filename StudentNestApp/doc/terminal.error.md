perationfor more details.
    at async GET (src/app/api/rooms/route.ts:215:19)
  213 |
  214 |     // Get total count for pagination
> 215 |     const total = await Room.countDocuments(filter);
      |                   ^
  216 |
  217 |     // Fetch rooms with owner information
  218 |     const rooms = await Room.find(filter) {
  errorLabelSet: Set(0) {},
  errorResponse: [Object],
  ok: 0,
  code: 5626500,
  codeName: 'Location5626500',
  '$clusterTime': [Object],
  operationTime: new Timestamp({ t: 1766995252, i: 1 })
}
 GET /api/rooms?page=1&limit=20&lat=31.3773137&lng=75.5428646&maxDistance=50 500 in 586ms
Error fetching rooms: MongoServerError: $geoNear, $near, and $nearSphere are not allowed in this context, as these operators require sorting geospatial data. If you do not need sort, consider using $geoWithin instead. Check out https://dochub.mongodb.org/core/near-sort-operation and https://dochub.mongodb.org/core/nearSphere-sort-operationfor more details.
    at async GET (src/app/api/rooms/route.ts:215:19)
  213 |
  214 |     // Get total count for pagination
> 215 |     const total = await Room.countDocuments(filter);
      |                   ^
  216 |
  217 |     // Fetch rooms with owner information
  218 |     const rooms = await Room.find(filter) {
  errorLabelSet: Set(0) {},
  errorResponse: [Object],
  ok: 0,
  code: 5626500,
  codeName: 'Location5626500',
  '$clusterTime': [Object],
  operationTime: new Timestamp({ t: 1766995254, i: 1 })
}
 GET /api/rooms?page=1&limit=20&lat=31.3773137&lng=75.5428646&maxDistance=50 500 in 270ms
Error fetching rooms: MongoServerError: $geoNear, $near, and $nearSphere are not allowed in this context, as these operators require sorting geospatial data. If you do not need sort, consider using $geoWithin instead. Check out https://dochub.mongodb.org/core/near-sort-operation and https://dochub.mongodb.org/core/nearSphere-sort-operationfor more details.
    at async GET (src/app/api/rooms/route.ts:215:19)
  213 |
  214 |     // Get total count for pagination
> 215 |     const total = await Room.countDocuments(filter);
      |                   ^
  216 |
  217 |     // Fetch rooms with owner information
  218 |     const rooms = await Room.find(filter) {
  errorLabelSet: Set(0) {},
  errorResponse: [Object],
  ok: 0,
  code: 5626500,
  codeName: 'Location5626500',
  '$clusterTime': [Object],
  operationTime: new Timestamp({ t: 1766995256, i: 1 })
}
 GET /api/rooms?page=1&limit=20&lat=31.3773137&lng=75.5428646&maxDistance=50 500 in 183ms
 ✓ Compiled /api/bookings in 471ms (303 modules)
 GET /api/bookings 200 in 800ms
 ✓ Compiled /api/visit-requests in 363ms (533 modules)
 GET /api/visit-requests 200 in 695ms
 ○ Compiling /api/payments/[id] ...
 ✓ Compiled /api/payments/[id] in 904ms (537 modules)
 GET /api/payments? 200 in 1113ms
Error: Route "/api/payments/[id]" used `params.id`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at GET (src/app/api/payments/[id]/route.ts:45:51)
  43 |     await connectDB();
  44 |
> 45 |     const payment = await Payment.findById(params.id)
     |                                                   ^
  46 |       .populate('bookingId', 'startDate endDate status monthlyRent')
  47 |       .populate('studentId', 'fullName email phone')
  48 |       .populate('ownerId', 'fullName email phone')
Error fetching payment: CastError: Cast to ObjectId failed for value "summary" (type string) at path "_id" for model "Payment"
    at async GET (src/app/api/payments/[id]/route.ts:45:21)
  43 |     await connectDB();
  44 |
> 45 |     const payment = await Payment.findById(params.id)
     |                     ^
  46 |       .populate('bookingId', 'startDate endDate status monthlyRent')
  47 |       .populate('studentId', 'fullName email phone')
  48 |       .populate('ownerId', 'fullName email phone') {
  stringValue: '"summary"',
  messageFormat: undefined,
  kind: 'ObjectId',
  value: 'summary',
  path: '_id',
  reason: BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer
      at async GET (src/app/api/payments/[id]/route.ts:45:21)
    43 |     await connectDB();
    44 |
  > 45 |     const payment = await Payment.findById(params.id)
       |                     ^
    46 |       .populate('bookingId', 'startDate endDate status monthlyRent')
    47 |       .populate('studentId', 'fullName email phone')
    48 |       .populate('ownerId', 'fullName email phone'),
  valueType: 'string'
}
 GET /api/payments/summary 500 in 2481ms
Error fetching rooms: MongoServerError: $geoNear, $near, and $nearSphere are not allowed in this context, as these operators require sorting geospatial data. If you do not need sort, consider using $geoWithin instead. Check out https://dochub.mongodb.org/core/near-sort-operation and https://dochub.mongodb.org/core/nearSphere-sort-operationfor more details.
    at async GET (src/app/api/rooms/route.ts:215:19)
  213 |
  214 |     // Get total count for pagination
> 215 |     const total = await Room.countDocuments(filter);
      |                   ^
  216 |
  217 |     // Fetch rooms with owner information
  218 |     const rooms = await Room.find(filter) {
  errorLabelSet: Set(0) {},
  errorResponse: [Object],
  ok: 0,
  code: 5626500,
  codeName: 'Location5626500',
  '$clusterTime': [Object],
  operationTime: new Timestamp({ t: 1766995269, i: 1 })
}
 GET /api/rooms?page=1&limit=20&lat=31.3773137&lng=75.5428646&maxDistance=50 500 in 463ms
Error fetching rooms: MongoServerError: $geoNear, $near, and $nearSphere are not allowed in this context, as these operators require sorting geospatial data. If you do not need sort, consider using $geoWithin instead. Check out https://dochub.mongodb.org/core/near-sort-operation and https://dochub.mongodb.org/core/nearSphere-sort-operationfor more details.
    at async GET (src/app/api/rooms/route.ts:215:19)
  213 |
  214 |     // Get total count for pagination
> 215 |     const total = await Room.countDocuments(filter);
      |                   ^
  216 |
  217 |     // Fetch rooms with owner information
  218 |     const rooms = await Room.find(filter) {
  errorLabelSet: Set(0) {},
  errorResponse: [Object],
  ok: 0,
  code: 5626500,
  codeName: 'Location5626500',
  '$clusterTime': [Object],
  operationTime: new Timestamp({ t: 1766995270, i: 2 })
}
 GET /api/rooms?page=1&limit=20&lat=31.3773137&lng=75.5428646&maxDistance=50 500 in 340ms
Error fetching rooms: MongoServerError: $geoNear, $near, and $nearSphere are not allowed in this context, as these operators require sorting geospatial data. If you do not need sort, consider using $geoWithin instead. Check out https://dochub.mongodb.org/core/near-sort-operation and https://dochub.mongodb.org/core/nearSphere-sort-operationfor more details.
    at async GET (src/app/api/rooms/route.ts:215:19)
  213 |
  214 |     // Get total count for pagination
> 215 |     const total = await Room.countDocuments(filter);
      |                   ^
  216 |
  217 |     // Fetch rooms with owner information
  218 |     const rooms = await Room.find(filter) {
  errorLabelSet: Set(0) {},
  errorResponse: [Object],
  ok: 0,
  code: 5626500,
  codeName: 'Location5626500',
  '$clusterTime': [Object],
  operationTime: new Timestamp({ t: 1766995273, i: 1 })
}
 GET /api/rooms?page=1&limit=20&lat=31.3773137&lng=75.5428646&maxDistance=50 500 in 172ms
[Create Order] 1. Request received
[Create Order] 2. User authenticated: 6950d6fd11e2f84421faad0f
[Create Order] 3. Database connected
(node:67462) [MONGOOSE] Warning: Duplicate schema index on {"orderId":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:67462) [MONGOOSE] Warning: Duplicate schema index on {"paymentId":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
(node:67462) [MONGOOSE] Warning: Duplicate schema index on {"userId":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
[Create Order] 4. Request body parsed: {
  amount: 9000,
  currency: undefined,
  bookingId: '695156bffcc9a493f8e751ab',
  propertyId: undefined
}
[Create Order] 5. Amount validated: 9000
[Create Order] 6. Amount in paise: 900000
[Create Order] 7. Receipt generated: receipt_1766995411811_6950d6fd11e2f84421faad0f
[Create Order] 8. Creating Razorpay order...
[Razorpay] Getting instance...
[Razorpay] Creating order with options: {
  amount: 900000,
  currency: 'INR',
  receipt: 'receipt_1766995411811_6950d6fd...',
  hasNotes: true
}
(node:67462) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
[Razorpay] Order creation error:
[Razorpay] Error message: undefined
[Razorpay] Error details: {
  statusCode: 401,
  error: { code: 'BAD_REQUEST_ERROR', description: 'Authentication failed' }
}
[Razorpay] Error stack: undefined
[Razorpay] API Error: { code: 'BAD_REQUEST_ERROR', description: 'Authentication failed' }
[Create Order] 9. Razorpay order result: { success: false, hasData: false, error: 'Failed to create order' }
[Create Order] Razorpay order creation failed: Failed to create order
 POST /api/payments/create-order 500 in 1183ms
