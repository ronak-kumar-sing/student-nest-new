 WARN  SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead. See https://github.com/th3rdwave/react-native-safe-area-context
 LOG  📡 API URL: http://192.168.1.18:3001/api
 ERROR  Text strings must be rendered within a <Text> component.

Code: index.tsx
  284 |
  285 |         {/* All Rooms */}
> 286 |         <View className="px-6 pb-8">
      |         ^
  287 |           <View className="flex-row items-center justify-between mb-4">
  288 |             <Text className="text-white text-lg font-bold">All Rooms</Text>
  289 |             <Text className="text-dark-muted text-sm">{rooms.length} available</Text>
Call Stack
  HomeScreen (app/(tabs)/index.tsx:286:9)
  TabsLayout (app/(tabs)/_layout.tsx:8:5)
  RootLayout (app/_layout.tsx:25:13)
  ERROR  Failed to refresh user: [AxiosError: Request failed with status code 404]

Call Stack
  settle (node_modules/axios/dist/esm/axios.js:2059:28)
  onloadend (node_modules/axios/dist/esm/axios.js:2520:13)
  invoke (node_modules/react-native/src/private/webapis/dom/events/EventTarget.js:382:29)
  dispatch (node_modules/react-native/src/private/webapis/dom/events/EventTarget.js:293:11)
  INTERNAL_DISPATCH_METHOD_KEY (node_modules/react-native/src/private/webapis/dom/events/EventTarget.js:229:13)
  dispatchTrustedEvent (node_modules/react-native/src/private/webapis/dom/events/internals/EventTargetInternals.js:51:51)
  setReadyState (node_modules/react-native/Libraries/Network/XMLHttpRequest.js:704:27)
  __didCompleteResponse (node_modules/react-native/Libraries/Network/XMLHttpRequest.js:442:25)
  apply (<native>)
  RCTNetworking.addListener$argument_1 (node_modules/react-native/Libraries/Network/XMLHttpRequest.js:606:35)
  apply (<native>)
  emit (node_modules/react-native/Libraries/vendor/emitter/EventEmitter.js:130:36)
  apply (<native>)
  <anonymous> (node_modules/@babel/runtime/helpers/superPropGet.js:6:19)
  RCTDeviceEventEmitterImpl#emit (node_modules/react-native/Libraries/EventEmitter/RCTDeviceEventEmitter.js:33:5)
  Axios$1#request (node_modules/axios/dist/esm/axios.js:3396:58)
  throw (<native>)
  asyncGeneratorStep (node_modules/@babel/runtime/helpers/asyncToGenerator.js:3:17)
  _throw (node_modules/@babel/runtime/helpers/asyncToGenerator.js:20:27)
  tryCallOne (address at (InternalBytecode.js:1:1180)
  anonymous (address at (InternalBytecode.js:1:1874)|

Code: my-shares.tsx
  206 |           </View>
  207 |         ) : (
> 208 |           shares.map((share: any, index: number) => {
      |                     ^
  209 |             const status = STATUS_COLORS[share.status] || STATUS_COLORS.active;
  210 |             const pendingApplications = share.applications?.filter(
  211 |               (app: any) => app.status === 'pending'
Call Stack
  MySharesScreen (app/room-sharing/my-shares.tsx:208:21)

Code: _layout.tsx
  23 |           <AuthProvider>
  24 |             <StatusBar style="light" />
> 25 |             <Stack
     |             ^
  26 |               screenOptions={{
  27 |                 headerShown: false,
  28 |                 contentStyle: { backgroundColor: '#0A0A0B' },
Call Stack
ERROR  [TypeError: visits.filter is not a function (it is undefined)]

Code: index.tsx
  103 |   const visits: VisitRequest[] = data?.data || [];
  104 |
> 105 |   const upcomingVisits = visits.filter((v) =>
      |                                       ^
  106 |     ['pending', 'confirmed', 'rescheduled'].includes(v.status)
  107 |   );
  108 |   const pastVisits = visits.filter((v) =>
Call Stack
  VisitsScreen (app/visits/index.tsx:105:39)

Code: _layout.tsx
  23 |           <AuthProvider>
  24 |             <StatusBar style="light" />
> 25 |             <Stack
     |             ^
  26 |               screenOptions={{
  27 |                 headerShown: false,
  28 |                 contentStyle: { backgroundColor: '#0A0A0B' },
Call Stack
  RootLayout (app/_layout.tsx:25:13)
 ERROR  [TypeError: negotiations.filter is not a function (it is undefined)]

Code: index.tsx
  103 |   const negotiations: Negotiation[] = data?.data || [];
  104 |
> 105 |   const filteredNegotiations = negotiations.filter((n) => {
      |                                                   ^
  106 |     if (activeTab === 'all') return true;
  107 |     if (activeTab === 'pending') return n.status === 'pending' || n.status === 'countered';
  108 |     return n.status === activeTab;
Call Stack
  NegotiationsScreen (app/negotiations/index.tsx:105:51)

Code: _layout.tsx
  23 |           <AuthProvider>
  24 |             <StatusBar style="light" />
> 25 |             <Stack
     |             ^
  26 |               screenOptions={{
  27 |                 headerShown: false,
  28 |                 contentStyle: { backgroundColor: '#0A0A0B' },
Call Stack
  RootLayout (app/_layout.tsx:25:13)
