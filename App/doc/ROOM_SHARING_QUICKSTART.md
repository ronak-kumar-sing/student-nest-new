# 🚀 Room Sharing Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd StudentNest
npm install @react-native-picker/picker
```

### Step 2: Create Type Definitions
Create file: `src/types/roomSharing.ts`
- Copy from: `ROOM_SHARING_IMPLEMENTATION.md` (Section 1.1)
- Lines: ~150

### Step 3: Add API Methods
Edit file: `src/services/api.ts`
- Copy from: `ROOM_SHARING_IMPLEMENTATION.md` (Section 1.2)
- Lines: ~200
- Add 9 new methods to API class

### Step 4: Create Screen Files
Create these 3 files:

1. **`src/app/(tabs)/room-sharing/index.tsx`**
   - Copy from: `ROOM_SHARING_IMPLEMENTATION.md` (Section 2.1)
   - Purpose: List all room shares
   - Lines: ~400

2. **`src/app/(tabs)/room-sharing/create.tsx`**
   - Copy from: `ROOM_SHARING_SCREENS.md` (Screen 2)
   - Purpose: Create new room share
   - Lines: ~600

3. **`src/app/(tabs)/room-sharing/[id].tsx`**
   - Copy from: `ROOM_SHARING_SCREENS.md` (Screen 3)
   - Purpose: View room share details
   - Lines: ~450

### Step 5: Test
```bash
npm start
```

Navigate to: `/room-sharing` in your app

---

## 📁 File Structure
```
StudentNest/
├── src/
│   ├── types/
│   │   └── roomSharing.ts          # NEW - Type definitions
│   ├── services/
│   │   └── api.ts                  # MODIFY - Add 9 methods
│   └── app/
│       └── (tabs)/
│           └── room-sharing/       # NEW FOLDER
│               ├── index.tsx       # List screen
│               ├── create.tsx      # Create screen
│               └── [id].tsx        # Details screen
```

---

## 🎯 API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/room-sharing` | List all shares |
| POST | `/room-sharing` | Create new share |
| GET | `/room-sharing/{id}` | Get details |
| POST | `/room-sharing/{id}/apply` | Apply to join |
| GET | `/room-sharing/applications` | My applications |
| PUT | `/room-sharing/applications/{id}` | Accept/Reject |
| GET | `/room-sharing/my-shares` | My posted shares |
| PUT | `/room-sharing/{id}/deactivate` | Close share |
| GET | `/room-sharing/statistics` | Get stats |

**Base URL:** `https://student-nest-for.vercel.app/api`

---

## 🔑 Key Features

### List Screen
- ✅ Browse all room shares
- ✅ Filter by gender, budget, city
- ✅ View available slots
- ✅ See cost per person
- ✅ Pull to refresh
- ✅ Infinite scroll

### Create Screen
- ✅ Auto-load room details (if from room page)
- ✅ Set max participants (1-5)
- ✅ Define rent per person
- ✅ Select gender preference
- ✅ Choose lifestyle preferences
- ✅ Set availability date
- ✅ Add contact information

### Details Screen
- ✅ View full property images
- ✅ See cost breakdown
- ✅ View requirements
- ✅ Check room features
- ✅ Contact host (Call/WhatsApp)
- ✅ Apply with message

---

## 🎨 Theme Integration

All screens use your existing theme:
```typescript
const { theme } = useTheme();

// Colors automatically adapt
backgroundColor: theme.colors.background
color: theme.colors.text
borderColor: theme.colors.border
```

Dark mode works out of the box! ✨

---

## 🧪 Testing Checklist

- [ ] List screen loads data
- [ ] Can create new room share
- [ ] Details screen shows correctly
- [ ] Apply button sends application
- [ ] Contact buttons work (Call/WhatsApp)
- [ ] Filters work properly
- [ ] Pull-to-refresh works
- [ ] Infinite scroll loads more
- [ ] Dark mode looks good
- [ ] iOS and Android tested

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module '@react-native-picker/picker'"
**Fix:**
```bash
npm install @react-native-picker/picker
```

### Issue: API returns 401 Unauthorized
**Fix:** Ensure user is logged in and token is valid
```typescript
// Check in api.ts that token is being sent
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Issue: "Room share not found"
**Fix:** Verify the room ID is correct
```typescript
console.log('Room ID:', id);
```

### Issue: Images not loading
**Fix:** Check Cloudinary URLs
```typescript
uri: item.property?.images?.[0] || 'https://via.placeholder.com/400x200'
```

---

## 💡 Pro Tips

1. **Pre-fill from Room Details**
   ```typescript
   // When navigating from room page:
   router.push(`/room-sharing/create?roomId=${room.id}`);
   ```

2. **Calculate Costs Automatically**
   ```typescript
   const rentPerPerson = Math.floor(totalRent / maxParticipants);
   const depositPerPerson = Math.ceil(deposit / maxParticipants);
   ```

3. **Validate Before Submit**
   ```typescript
   if (description.length < 50) {
     Alert.alert('Error', 'Description too short');
     return;
   }
   ```

4. **Use Native Linking**
   ```typescript
   Linking.openURL(`tel:${phone}`);
   Linking.openURL(`whatsapp://send?phone=${phone}`);
   ```

---

## 📱 Screen Navigation Flow

```
┌─────────────────┐
│  Room Details   │
│   (any room)    │
└────────┬────────┘
         │
         │ Tap "Share Room"
         ↓
┌─────────────────┐
│ Create Room     │
│  Share Form     │◄────────┐
└────────┬────────┘         │
         │                  │
         │ Submit           │ Tap "+"
         ↓                  │
┌─────────────────┐         │
│  Room Sharing   │─────────┘
│   List Screen   │
└────────┬────────┘
         │
         │ Tap card
         ↓
┌─────────────────┐
│  Room Share     │
│   Details       │
└────────┬────────┘
         │
         │ Tap "Apply"
         ↓
┌─────────────────┐
│  Application    │
│   Sent! ✓       │
└─────────────────┘
```

---

## ⚡ Performance Tips

1. **Lazy Load Images**
   ```typescript
   <Image
     source={{ uri }}
     resizeMode="cover"
     defaultSource={require('@/assets/placeholder.png')}
   />
   ```

2. **Memoize List Items**
   ```typescript
   const renderItem = useCallback(({ item }) => (
     <RoomShareCard item={item} />
   ), []);
   ```

3. **Optimize Cloudinary Images**
   ```typescript
   const optimizedUrl = `${imageUrl}?w=400&h=300&f=auto&q=auto`;
   ```

4. **Cache API Responses**
   ```typescript
   const [cache, setCache] = useState({});
   if (cache[id]) return cache[id];
   ```

---

## 🎓 Next Steps

After implementing basic screens:

1. **Add Filter UI**
   - Gender filter chips
   - Budget slider
   - City dropdown
   - Sort options

2. **Add My Applications Screen**
   - List all applications
   - Track status
   - Withdraw application

3. **Add My Shares Screen**
   - View posted shares
   - Manage applications
   - Edit/Close shares

4. **Polish UI**
   - Add animations
   - Loading skeletons
   - Error boundaries
   - Success toasts

---

## 📚 Resources

- **Full Implementation**: `ROOM_SHARING_IMPLEMENTATION.md`
- **Screen Code**: `ROOM_SHARING_SCREENS.md`
- **Summary**: `ROOM_SHARING_COMPLETE.md`
- **API Docs**: `API_REFERENCE.md`

---

**Ready to code? Start with Step 1! 🚀**

Questions? Check the full documentation files above.
