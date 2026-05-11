# Asset To Estimate Detail Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user clicks an asset card on `/asset`, navigate to `/orders/estimate-detail?commissionId=<clicked commissionId>`.

**Architecture:** Reuse the existing React Router route for `/orders/estimate-detail` and the existing `EstimateDetailPage` query parsing. Keep the change surgical by updating only the asset card click target and the related tests.

**Tech Stack:** React 19, React Router 7, Vitest, Testing Library, Vite.

---

## File Structure

- Modify: `src/pages/Asset/CheckAssetPage.jsx`
  - Responsibility: Builds the target URL when an asset card is clicked.
- Modify: `src/pages/Asset/CheckAssetPage.test.jsx`
  - Responsibility: Verifies clicking a rendered asset calls `navigate` with `/orders/estimate-detail?commissionId=<id>` and preserves navigation state.
- Optionally modify: `src/pages/Commission/EstimateDetailPage.test.jsx`
  - Responsibility: If desired, verify the same page resolves `commissionId` when mounted at the canonical `/orders/estimate-detail` route.

## Assumptions

- `commissionId=3` in the request is an example. The implementation should use the clicked asset item's real `commissionId`.
- If the clicked item also has `orderId`, it may remain in the query string as `orderId=<id>` only if the existing page still needs it. To match the requested URL exactly, prefer only `commissionId` unless there is a backend data-loading reason to preserve `orderId`.
- The existing `/orders/estimate-detail` route already exists in `src/App.jsx`, and `EstimateDetailPage` already reads `commissionId` from `location.search`.

### Task 1: Add a Failing Asset Click Test

**Files:**
- Modify: `src/pages/Asset/CheckAssetPage.test.jsx`

- [ ] **Step 1: Add an asset card click test**

Add this test inside the existing `describe('CheckAssetPage', () => { ... })` block:

```jsx
it('opens the canonical estimate detail page when clicking an asset card', async () => {
  orderapi.getAssets.mockResolvedValue({
    isSuccess: true,
    data: {
      content: [
        {
          assetId: 3,
          commissionId: 3,
          assetImageUrl: 'https://cdn.example.com/assets/3.png',
          createdAt: '2026-05-07T12:30:00',
        },
      ],
      page: { number: 0, size: 20, totalPages: 1, totalElements: 1 },
    },
  });

  render(
    <BrowserRouter>
      <CheckAssetPage />
    </BrowserRouter>,
  );

  fireEvent.click(await screen.findByRole('button', { name: /의뢰 대상: 3 상세 보기/ }));

  expect(mockNavigate).toHaveBeenCalledWith('/orders/estimate-detail?commissionId=3', {
    state: expect.objectContaining({
      commissionId: 3,
      order: expect.objectContaining({
        commissionId: 3,
      }),
    }),
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npm test -- src/pages/Asset/CheckAssetPage.test.jsx --run
```

Expected before implementation: FAIL because the current code navigates to `/estimate-detail?commissionId=3`.

### Task 2: Update the Asset Click Target

**Files:**
- Modify: `src/pages/Asset/CheckAssetPage.jsx`

- [ ] **Step 1: Change the navigation target**

In `handleOpenCommission`, replace:

```jsx
navigate(`/estimate-detail?${searchParams.toString()}`, {
```

with:

```jsx
navigate(`/orders/estimate-detail?${searchParams.toString()}`, {
```

- [ ] **Step 2: Decide whether to keep `orderId` in the query**

For the exact requested URL shape, make the query only include `commissionId`:

```jsx
const searchParams = new URLSearchParams();
if (item.commissionId) searchParams.set('commissionId', String(item.commissionId));
```

Keep `orderId` in `state` so the page can still hydrate from existing state:

```jsx
state: {
  commissionId: item.commissionId,
  orderId: item.orderId,
  order: buildEstimateOrderState(item),
},
```

- [ ] **Step 3: Run the focused asset test**

Run:

```bash
npm test -- src/pages/Asset/CheckAssetPage.test.jsx --run
```

Expected after implementation: PASS.

### Task 3: Verify the Canonical Estimate Detail Route

**Files:**
- Optionally modify: `src/pages/Commission/EstimateDetailPage.test.jsx`

- [ ] **Step 1: Add or adjust a route-level test if coverage feels too implicit**

The page already has a test for `/estimate-detail?commissionId=34`. Add the canonical route variant if you want to lock the new path explicitly:

```jsx
render(
  <MemoryRouter initialEntries={['/orders/estimate-detail?commissionId=34']}>
    <Routes>
      <Route path="/orders/estimate-detail" element={<EstimateDetailPage />} />
    </Routes>
  </MemoryRouter>,
);
```

Expected behavior should match the existing query-parameter test: `EstimateDetailPage` reads `commissionId` from `location.search` and calls `orderapi.getOrders()` when needed.

- [ ] **Step 2: Run the estimate detail test**

Run:

```bash
npm test -- src/pages/Commission/EstimateDetailPage.test.jsx --run
```

Expected: PASS.

### Task 4: Final Verification

**Files:**
- No additional file changes.

- [ ] **Step 1: Run related tests**

Run:

```bash
npm test -- src/pages/Asset/CheckAssetPage.test.jsx src/pages/Commission/EstimateDetailPage.test.jsx --run
```

Expected: PASS.

- [ ] **Step 2: Run lint if the project is in a lint-clean state**

Run:

```bash
npm run lint
```

Expected: no new lint errors from the changed files.

- [ ] **Step 3: Manual browser check**

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/asset
```

Click the asset whose `commissionId` is `3`.

Expected URL:

```text
http://localhost:5173/orders/estimate-detail?commissionId=3
```

Expected page: estimate detail screen renders using the clicked commission's data.

## Self-Review

- Spec coverage: The plan covers the requested asset click behavior and the target URL.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: The plan uses existing `commissionId`, `orderId`, `order`, `mockNavigate`, `orderapi.getAssets`, and React Router test patterns already present in the codebase.
