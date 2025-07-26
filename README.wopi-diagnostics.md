# WOPI Diagnostics & Manual Testing

## 1. Simulate CheckFileInfo via curl

```
curl -v -X GET \
  'https://YOUR_DEPLOYED_DOMAIN/api/wopi/files/sample.docx?access_token=YOUR_WOPI_TOKEN&WOPISrc=https%3A%2F%2FYOUR_DEPLOYED_DOMAIN%2Fapi%2Fwopi%2Ffiles%2Fsample.docx' \
  -H 'Host: YOUR_DEPLOYED_DOMAIN'
```
- Replace `YOUR_DEPLOYED_DOMAIN` and `YOUR_WOPI_TOKEN` accordingly.
- The response should be valid JSON with all required WOPI fields and the `X-WOPI-ItemVersion` header.

## 2. What to Check in the Response
- HTTP 200 OK
- JSON body with:
  - `BaseFileName` (string)
  - `Size` (number)
  - `UserId` (string)
  - `SupportsUpdate`, `SupportsLocks`, `SupportsComments` (all `true`)
  - `ItemVersion` or `X-WOPI-ItemVersion` header
- No double-encoded or malformed WOPISrc in the request

## 3. Troubleshooting Checklist
- [ ] Is the CheckFileInfo route hit? (Check logs for `[WOPI] Route hit: CheckFileInfo, status: 200`)
- [ ] Is the iframe URL constructed and logged as expected?
- [ ] Are there any 400/401/404 errors in the logs?
- [ ] Is the Host header correct (matches your public domain)?
- [ ] Is the access_token present and valid?
- [ ] Is the WOPISrc query param correctly encoded (not double-encoded)?
- [ ] Is the X-WOPI-ItemVersion header present in the response?

## 4. Common Causes of 400 Errors
- Malformed or missing access_token
- Malformed or double-encoded WOPISrc
- CheckFileInfo route not found or not responding
- Host header mismatch (Azure Front Door, custom domain)
- Missing required WOPI fields in JSON
- Missing X-WOPI-ItemVersion header

## 5. Fix Recommendations
- Ensure iframe URL is constructed with correct encoding (see EditorClient logging)
- Always include X-WOPI-ItemVersion header in CheckFileInfo and PutFile responses
- Validate and repair WOPISrc encoding in the API route
- Log and reject requests with missing or malformed tokens
- If using a custom domain or Azure Front Door, ensure Host header is forwarded and correct
- Clear browser and Office Online cache after making changes

---

See logs in your deployment for `[WOPI]` entries to trace the full request/response flow.
