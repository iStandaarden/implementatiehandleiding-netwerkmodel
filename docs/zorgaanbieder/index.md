# Implementatiehandleiding technische aansluiting zorgaanbieder

!!!info
    In dit artikel beschrijven we de onderdelen die nodig zijn om als zorgaanbieder aan te sluiten op het iWlz-netwerk. De handleiding is geschreven voor softwareleveranciers en voor zorgaanbieders die zelf software bouwen en beheren.

### Leeswijzer

- **Inleiding** verwijst naar de onderdelen van het afsprakenstelsel die je vooraf leest.
- **Wat verandert er** beschrijft wat er verandert ten opzichte van het estafettemodel dat je nu in productie hebt: het procesconcept, de inhoudelijke wijzigingen in het informatiemodel, en de gegevensmapping op hoofdlijnen.
- **Aansluiten** beschrijft VECOZO-aansluiting, systeemcertificaten (test en productie), IP-registratie, en endpoint-registratie in het tijdelijk adresboek (zie artikel: Implementatiestappen > [§2.2](./implementatiestappen.md#12-aansluiten-bij-vecozo), [§2.3](./implementatiestappen.md#13-aansluiten-op-het-iwlz-netwerk), [§2.4](./implementatiestappen.md#14-aansluiten-op-het-tijdelijk-adresboek)).
- **Autoriseren** beschrijft tokens aanvragen namens de zorgaanbieder op AGB-basis (actor), met de juiste scopes en audience; al het verkeer loopt via de PEP (zie artikel: Implementatiestappen > [§2.5](./implementatiestappen.md#15-autorisatie-inrichten)).
- **Notificaties ontvangen** beschrijft resource-endpoint voor notificaties uit het Bemiddelingsregister, en op termijn uit het Leveringsregister (zie artikel: Implementatiestappen > [§2.6.1](./implementatiestappen.md#161-notificaties-ontvangen)).
- **Raadplegen** beschrijft een GraphQL-client voor de keten Bemiddelingsregister -> `wlzIndicatieID` -> Indicatieregister, conform de query-templates en GraphQL-over-HTTP (zie artikel: Implementatiestappen > [§2.7](./implementatiestappen.md#17-inrichten-raadplegen)).
- **Leveringsregister vullen en notificeren** beschrijft de zorglevering registreren en de bijbehorende notificaties versturen (zie artikel: Implementatiestappen > [§2.6.2](./implementatiestappen.md#162-notificeren-verzenden-van-een-notificatie), [§2.8](./implementatiestappen.md#18-inrichten-van-het-leveringsregister), [§2.9](./implementatiestappen.md#19-initieel-vullen-van-het-leveringsregister)).
- **Melden** beschrijft foutmeldingen afhandelen; alleen de bronhouder registreert een melding-endpoint (zie artikel: Implementatiestappen > [§2.6.3](./implementatiestappen.md#163-melden)).
- **Foutafhandeling** beschrijft synchrone respons en foutmelding in plaats van het retourbericht (zie artikel: Implementatiestappen > [§2.10](./implementatiestappen.md#110-foutafhandeling)).
- **Tracelogging** beschrijft `X-B3-TraceId` en `X-B3-SpanId` (zie artikel: Implementatiestappen > [§2.11](./implementatiestappen.md#111-logging-en-tracing)).
- **Testen** beschrijft testomgeving, testcertificaat, fictieve BSN's en een onboarding-testdataset (zie artikel: Testen > [§3](./testen.md)).
- **Berichten uitfaseren** beschrijft genereren en verwerken van AW33/AW34, AW35/AW36 en AW39/AW310 vervalt. Let op de overgangsfase: zolang niet alle aanbieders zijn aangesloten, blijft [Silvester](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/silvester/) voor niet-aangesloten partijen AW33-berichten genereren (zie artikel: Wat verandert er > [§2.1](./wat-verandert-er.md#11-van-estafette-naar-netwerk), en artikel: Implementatiestappen > [§2.1](./implementatiestappen.md#11-controleer-of-je-systeem-netwerkmodel-proof-is)).


### Inleiding

Deze implementatiehandleiding beschrijft hoe je systemen aansluit op het iWlz-netwerkmodel. De handleiding is bedoeld voor softwareleveranciers en voor zorgaanbieders die zelf software ontwikkelen en beheren. De specificaties (informatiemodel en ondersteunende documentatie) staan op [iStandaarden](https://www.istandaarden.nl/domain/iwlz).

Het Afsprakenstelsel iWlz-netwerkmodel beschrijft de afspraken, architectuur en technische specificaties die nodig zijn om het iWlz-netwerkmodel te implementeren, te beheren en te laten functioneren. Lees voor implementatie in ieder geval:

- [Introductiepagina](https://istandaarden.github.io/Afsprakenstelsel-iWlz/)
- [Achtergrond en toelichting](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/inleiding/achtergrond_toelichting/)
- [Randvoorwaarden](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/organisatiebeleid/randvoorwaarden/)
- [Ontwerpkeuzes](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/organisatiebeleid/ontwerpkeuzes/)
- [Uitwisselprofiel Indicatie](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/uitwisselprofiel/uitwisselprofiel_indicatie/)
- [Uitwisselprofiel Bemiddeling](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/uitwisselprofiel/uitwisselprofiel_bemiddeling/)

Zodra het Uitwisselprofiel Levering gereed is, geldt deze leeslijst ook daarvoor. Dit profiel is nu nog in ontwikkeling.




