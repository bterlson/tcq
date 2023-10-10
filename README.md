# TCQ

Speaker queue for Technical Committee meetings. Originally for TC39, use by
others will require adaptation.

## Environment Variables for Configuration

- `TCQ_GH_SECRET` (`TCQ_LOCAL_GH_SECRET` for dev mode) - GitHub client secret
- `TCQ_GH_ID` (`TCQ_LOCAL_GH_ID` for dev mode) - GitHub client ID
- `TCQ_SESSION_SECRET` - Secret for session storage, can be arbitrarily generated
- `TCQ_CDB_SECRET` - Azure CosmosDB secret
- `TCQ_AI_IKEY` - Application Insights Instrumentation Key

## License

Apache-2.0 for code in this repo. Dependencies have their own licenses.
