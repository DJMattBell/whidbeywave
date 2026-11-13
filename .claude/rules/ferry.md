# Ferry Rules

Applies when editing: lib/ferry.ts, app/ferry/, components/WeatherTideWidget.tsx

- Route IDs: Mukilteo–Clinton = 7, Port Townsend–Coupeville = 8
- `fetchFerryBarStatus()` — lightweight alerts for hero strip / weather widget
- `fetchFerryPageData()` — full schedule + alerts for /ferry page
- WSDOT returns .NET JSON date format — parser in lib/ferry.ts handles this
- Ferry API failures degrade gracefully: "On Island Time" framing (see error-states.md)
