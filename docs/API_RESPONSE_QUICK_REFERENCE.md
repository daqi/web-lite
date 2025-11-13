# API Response Format - Quick Reference

## Standard Response Structure

```json
{
  "code": 200,
  "message": "Success",
  "data": { /* actual data */ }
}
```

## Response Methods (Context API)

```typescript
// ✅ Success (200)
return c.apiSuccess(data);
return c.apiSuccess(data, 'Custom message');

// ✅ Created (201)
return c.apiCreated(newItem);
return c.apiCreated(newItem, 'Custom message');

// ❌ Not Found (404)
return c.apiNotFound('Resource not found');

// ❌ Unauthorized (401)
return c.apiUnauthorized('Authentication required');

// ❌ Forbidden (403)
return c.apiForbidden('Permission denied');

// ❌ Validation Error (422)
return c.apiValidationError('Validation failed', errors);

// ❌ Custom Error
return c.apiError('Error message', 400);
```

## Common Patterns

### GET List
```typescript
app.get('/', async (c) => {
  const items = await service.getAll();
  return c.apiSuccess(items);
});
```

### GET Single
```typescript
app.get('/:id', async (c) => {
  const item = await service.getById(id);
  if (!item) return c.apiNotFound('Item not found');
  return c.apiSuccess(item);
});
```

### POST Create
```typescript
app.post('/', vValidator('json', schema), async (c) => {
  const data = c.req.valid('json');
  const item = await service.create(data);
  return c.apiCreated(item);
});
```

### PUT Update
```typescript
app.put('/:id', vValidator('json', schema), async (c) => {
  const item = await service.update(id, data);
  if (!item) return c.apiNotFound('Item not found');
  return c.apiSuccess(item);
});
```

### DELETE
```typescript
app.delete('/:id', async (c) => {
  const success = await service.delete(id);
  if (!success) return c.apiNotFound('Item not found');
  return c.apiSuccess(null, 'Deleted successfully');
});
```

## Error Handling

```typescript
try {
  const result = await service.operation(data);
  return c.apiSuccess(result);
} catch (error) {
  const message = error instanceof Error
    ? error.message
    : 'Operation failed';
  return c.apiError(message, 400);
}
```

## Status Codes

| Code | Constant | Message | Use Case |
|------|----------|---------|----------|
| 200 | SUCCESS | Success | Successful operation |
| 201 | CREATED | Created successfully | Resource created |
| 400 | BAD_REQUEST | Bad request | Invalid parameters |
| 401 | UNAUTHORIZED | Unauthorized | Not authenticated |
| 403 | FORBIDDEN | Forbidden | Not authorized |
| 404 | NOT_FOUND | Not found | Resource not found |
| 422 | VALIDATION_ERROR | Validation error | Data validation failed |
| 500 | INTERNAL_ERROR | Internal server error | Server error |

## JSON Model Auto-Generation

All auto-generated routes use the standard response format:

```bash
pnpm run generate:model product
```

Generated code automatically includes:
- ✅ Standard response format
- ✅ English error messages
- ✅ Proper status codes
- ✅ Type-safe responses

## Remember

- ✅ Always use English error messages
- ✅ Use appropriate HTTP status codes
- ✅ Provide meaningful error messages
- ✅ Use `c.apiSuccess()` for general success
- ✅ Use `c.apiCreated()` for resource creation
- ✅ Return `null` data for DELETE operations
