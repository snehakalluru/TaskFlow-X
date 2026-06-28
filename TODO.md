# TODO - TaskFlow X Backend/Frontend Integration

## Discovery & Validation
- [ ] Inspect all backend routes + authentication flow (already partially inspected).
- [ ] Fix frontend environment/API base URL resolution.
- [ ] Remove any hardcoded API URLs (search + replace).
- [ ] Centralize API configuration and update all API calls.
- [ ] Ensure backend CORS allows frontend origin.

## Implementation
- [ ] Update `frontend/src/providers/AuthProvider.tsx` to use centralized axios instance + apiRoutes.
- [ ] Update `frontend/src/pages/DashboardPage.tsx` to use centralized apiRoutes.
- [ ] Add/verify `VITE_API_BASE_URL` usage in Vite config if needed.

## QA / Run
- [ ] Start backend and frontend.
- [ ] Verify registration works.
- [ ] Verify login works.
- [ ] Verify token storage (localStorage) persists and protects routes.
- [ ] Verify protected routes work.
- [ ] Verify refresh/user me flow works.
- [ ] Fix any remaining CORS/404/network/routing issues.
- [ ] Ensure no TypeScript/build/console errors.

