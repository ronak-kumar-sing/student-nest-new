 ERROR  [TypeError: reviews.slice is not a function (it is undefined)]

Code: [id].tsx
  642 |                     <Text className={`font-semibold ml-2 ${isSaved ? 'text-primary-500' : 'text-dark-text'}`}>
  643 |                       {isSaved ? 'Saved' : 'Save for Later'}
> 644 |                     </Text>
      |                            ^
  645 |                   </Pressable>
  646 |
  647 |                   <Pressable
Call Stack
  RoomDetailScreen (app/room/[id].tsx:644:28)

Code: search.tsx
  228 |             showsVerticalScrollIndicator={false}
  229 |             refreshControl={
> 230 |               <RefreshControl
      |               ^
  231 |                 refreshing={isRefetching}
  232 |                 onRefresh={refetch}
  233 |                 tintColor="#F97316"
Call Stack
  SearchScreen (app/(tabs)/search.tsx:230:15)
  Error: Route "/api/room-sharing/[id]" used `params.id`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at GET (src/app/api/room-sharing/[id]/route.ts:35:28)
  33 |   try {
  34 |     const { userId } = await verifyUser(request);
> 35 |     const shareId = params.id;
     |                            ^
  36 |
  37 |     await connectDB();
  38 |
 GET /api/room-sharing/6950da2dd6ff82b1700b002a 200 in 820ms
 ○ Compiling /api/room-sharing/[id]/apply ...
 ✓ Compiled /api/room-sharing/[id]/apply in 602ms (2005 modules)
Error: Route "/api/room-sharing/[id]/apply" used `params.id`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at POST (src/app/api/room-sharing/[id]/apply/route.ts:58:28)
  56 |
  57 |     const { userId } = verification;
> 58 |     const shareId = params.id;
     |                            ^
  59 |     const body = await request.json();
  60 |     const { message } = body;
  61 |
 POST /api/room-sharing/6950da2dd6ff82b1700b002a/apply 400 in 2162ms

