# LumberLink Devlog #1 - Building the Foundation

## Project Overview
I'm building LumberLink, a React Native marketplace that connects lumber mills with buyers. Think of it as a B2B platform where mill owners can list their inventory and buyers can browse and purchase lumber products. This first iteration focused on establishing the core functionality and user workflows.

## Progress until 7-18-2025:

### 🏗️ Core Features Implemented
- **User Authentication**: Complete login/register system with JWT tokens
- **Mill Management**: Users can create, edit, and delete their mills
- **Inventory System**: Mill owners can add detailed lumber inventory to their mills
- **Mill Selection**: Buyers can browse and select mills to view inventory
- **Order Processing**: Basic cart and order functionality

### 📱 Technical Stack
- **Frontend**: React Native with Expo, TypeScript
- **Backend**: Node.js with Express, MongoDB
- **Authentication**: JWT tokens with AsyncStorage
- **Navigation**: Expo Router with tab-based navigation
- **Testing**: Jest (with some challenges!)

## Major Challenges

### 🛡️ SafeAreaView Layout Issues
Spent considerable time wrestling with `SafeAreaView` on the Owned Mills screen. The component was creating layout conflicts with the modal forms used for adding mills and inventory. After several attempts to work around the padding issues, I decided to go with a simpler approach using manual padding (`paddingTop: 60`) in the styles. Sometimes the pragmatic solution is the best solution!

### 🧪 Testing Nightmare
Hit a major roadblock with React Native testing, especially on the LoginScreen component. The main issues were:
- **Version conflicts**: React 19.1.0 vs react-native-renderer 19.0.0 incompatibility
- **Native module errors**: TurboModuleRegistry errors when trying to mock React Native components
- **Expo compatibility**: Had to roll back to React 19.0.0 to maintain Expo Go compatibility

**Solution**: Created logic-only tests instead of component tests. Built comprehensive test coverage for business logic without dealing with React Native component rendering. Example:

```typescript
// Testing form validation logic without UI components
const validateLoginForm = (email: string, password: string) => {
  const errors: string[] = [];
  if (!email.trim()) errors.push('Email is required');
  if (!password.trim()) errors.push('Password is required');
  return { isValid: errors.length === 0, errors };
};
```

This approach gave me solid test coverage while avoiding the React Native testing complexity.

### 🗃️ Mill Data Integration Challenges
Encountered a significant data challenge with mill information. Found a public API that provides mill names and general location areas, but it's missing crucial contact details like phone numbers, email addresses, and precise latitude/longitude coordinates. The API data is quite loose and unorganized - think mill names with just city/province information.

**Current Status**: I've appended this raw mill data to the GitHub repository as a starting point, but it needs substantial work:
- **Missing contact info**: No phone/email data available
- **Imprecise locations**: General areas instead of exact coordinates
- **Data inconsistency**: Varying formats and incomplete entries
- **Manual geocoding needed**: Will require geocoding services to get lat/lng

**Next Steps**: Planning to implement a data enrichment pipeline that combines multiple sources and allows manual data entry for missing information. This is turning into a bigger project than initially anticipated, but accurate mill data is crucial for the platform's success.

## Key Design Decisions

### 👥 Single User Group Architecture
Initially considered separate user roles (sellers vs buyers), but decided on a unified user system where anyone can both buy and sell. My reasoning:
- **Real-world flexibility**: Lumber mills often buy excess inventory from other mills
- **Simpler architecture**: Reduces complexity in authentication and permissions
- **Future scalability**: Can always add role-based features later if needed

This decision simplified the data models and user workflows significantly.

### 🎯 MVP Focus
Kept this iteration focused on core marketplace functionality:
- ✅ User registration and authentication
- ✅ Mill creation and management
- ✅ Inventory listing and browsing
- ✅ Basic order processing
- 🔄 Payment integration (planned for next iteration)
- 🔄 Messaging system (planned for next iteration)
- 🔄 Mill data enrichment pipeline (unplanned but necessary)

## Current Status

### ✅ Completed Features
- Complete user authentication flow
- Mill CRUD operations with location data
- Comprehensive inventory management
- Mill selection and browsing
- Cart and order functionality
- Responsive dark/light theme support

### 📊 Architecture Highlights
- **Database Models**: User, Mill, Inventory, Order with proper relationships
- **API Design**: RESTful endpoints with JWT authentication
- **State Management**: Context API for user auth and mill selection
- **Error Handling**: Comprehensive validation and user feedback

### 🚧 Data Challenges
- Raw mill data collected from public API (stored in repo)
- Need to build data enrichment and validation system
- Manual verification process required for mill contact details

## Next Sprint Goals

### 🚀 Planned Features
1. **Data Pipeline**: Build mill data scraping and enrichment system
2. **Payment Integration**: Stripe or similar for secure transactions
3. **Messaging System**: In-app communication between buyers and sellers for pickup/delivery coordination
4. **Enhanced Search**: Advanced filtering by species, grade, location
5. **Inventory Analytics**: Dashboard for mill owners to track sales
6. **Mobile Optimization**: Improve responsive design for different screen sizes

### 🛠️ Technical Improvements
- Implement mill data validation and geocoding
- Add proper component testing (post React Native testing issues)
- Add real-time inventory updates
- Optimize performance for large inventory lists
- Add offline capability with data synchronization

## Lessons Learned

1. **Pragmatic Solutions**: Sometimes simple padding beats complex SafeAreaView configurations
2. **Testing Strategy**: Logic tests can provide excellent coverage without UI complexity
3. **Version Management**: React Native ecosystem requires careful version coordination
4. **User Experience**: Single user roles often make more sense than artificial separations
5. **MVP Focus**: Core functionality first, advanced features later
6. **Data Quality**: Real-world data is messy - plan for data cleaning and enrichment from day one

## Tech Stack Appreciation

The React Native + Node.js + MongoDB stack has been solid for rapid prototyping. Expo made deployment testing much easier, and TypeScript caught numerous potential bugs during development. However, the mill data integration challenge highlighted the importance of having robust data processing capabilities.

## Data Pipeline Strategy

For the mill data challenge, I'm planning a multi-step approach:

1. **Data Collection**: Continue gathering mill data from various APIs and sources
2. **Geocoding Integration**: Use Google Maps or similar service for precise coordinates
3. **Contact Enrichment**: Research tools for finding business contact information
4. **Manual Verification**: Build admin interface for data quality control
5. **User Contributions**: Allow mill owners to claim and update their profiles

This will be a significant undertaking but essential for platform credibility.

## Screenshots


---

**Want to follow along?** I'll be posting weekly updates as I tackle the mill data pipeline and add payment processing features. The focus remains on creating a practical tool that lumber industry professionals would actually use.

**Questions or suggestions?** I'd love feedback on data enrichment strategies or the architecture decisions!

#ReactNative #B2B #Lumber #DataPipeline #Startup #MobileApp #DevLog