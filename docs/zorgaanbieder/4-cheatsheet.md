1. **Aansluiten** beschrijft VECOZO-aansluiting, systeemcertificaten (test en productie), IP-registratie, en endpoint-registratie in het tijdelijk adresboek.   
   Zie: Implementatiestappen > [§2.2](./2-implementatiestappen.md#22-aansluiten-bij-vecozo), [§2.3](./2-implementatiestappen.md#23-aansluiten-op-het-iwlz-netwerk), [§2.4](./2-implementatiestappen.md#24-aansluiten-op-het-tijdelijk-adresboek).

2. **Autoriseren** beschrijft tokens aanvragen namens de zorgaanbieder op AGB-basis (actor), met de juiste scopes en audience; al het verkeer loopt via de PEP.  
   Zie: Implementatiestappen > [§2.5](./2-implementatiestappen.md#25-autorisatie-inrichten).
3. **Notificaties ontvangen** beschrijft resource-endpoint voor notificaties uit het Bemiddelingsregister, en op termijn uit het Leveringsregister.   
   Zie: Implementatiestappen > [§2.6.1](./2-implementatiestappen.md#261-notificaties-ontvangen).
4. **Raadplegen** beschrijft een GraphQL-client voor de keten Bemiddelingsregister -> `wlzIndicatieID` -> Indicatieregister, conform de query-templates en GraphQL-over-HTTP.  
   Zie: Implementatiestappen > [§2.7](./2-implementatiestappen.md#27-inrichten-raadplegen).
5. **Leveringsregister vullen en notificeren** beschrijft de zorglevering registreren en de bijbehorende notificaties versturen.  
   Zie: Implementatiestappen > [§2.6.2](./2-implementatiestappen.md#262-notificeren-verzenden-van-een-notificatie), [§2.8](./2-implementatiestappen.md#28-inrichten-van-het-leveringsregister), [§2.9](./2-implementatiestappen.md#29-initieel-vullen-van-het-leveringsregister).
6. **Melden** beschrijft foutmeldingen afhandelen; alleen de bronhouder registreert een melding-endpoint.  
   Zie: Implementatiestappen > [§2.6.3](./2-implementatiestappen.md#263-melden).
7. **Foutafhandeling** beschrijft synchrone respons en foutmelding in plaats van het retourbericht.  
   Zie: Implementatiestappen > [§2.10](./2-implementatiestappen.md#210-foutafhandeling).
8. **Tracelogging** beschrijft `X-B3-TraceId` en `X-B3-SpanId`.  
   Zie: Implementatiestappen > [§2.11](./2-implementatiestappen.md#211-logging-en-tracing).
9.  **Testen** beschrijft testomgeving, testcertificaat, fictieve BSN's en een onboarding-testdataset.  
    Zie: Testen > [§3](./3-testen.md).
10. **Berichten uitfaseren** beschrijft genereren en verwerken van AW33/AW34, AW35/AW36 en AW39/AW310 vervalt.  
    
    Let op: tijdens de overgangsfase: wanneer niet alle aanbieders zijn aangesloten op het netwerkmodel, blijft [Silvester](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/silvester/) voor niet-aangesloten partijen AW33-berichten genereren.   
    Zie: Wat verandert er > [§1.1](./1-wat-verandert-er.md#11-van-estafette-naar-netwerk), en : Implementatiestappen > [§2.1](./2-implementatiestappen.md#21-controleer-of-je-systeem-netwerkmodel-proof-is).
