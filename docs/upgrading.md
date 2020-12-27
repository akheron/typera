# Upgrading to version 2

TypeScript 4.1 is required:

```
npm install --save-dev typescript@>=4.1
```

If still using the function chaining syntax for routes, use the new syntax
instead:

```typescript
// OLD
route.get('/my/path')(middleware)(async request => { ... })

// NEW
route
  .get('/my/path')
  .use(middleware)
  .handler(async request => { ... })
```

Change route paths to use `:param`-style captures:

```typescript
// OLD
route.get('/category/', URL.int('id'), '/tag/', URL.str('tag'))

// NEW
route.get('/category/:id(int)/tag/:tag')
```

If you had defined custom capturing functions, use `route.useParamConversions()`
to use them in your paths.
