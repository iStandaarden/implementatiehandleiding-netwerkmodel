# Implementatiehandleiding technische aansluiting zorgaanbieder

!!!info
    In dit artikel beschrijven we de onderdelen die nodig zijn om als zorgaanbieder aan te sluiten op het iWlz-netwerk. De handleiding is geschreven voor softwareleveranciers en voor zorgaanbieders die zelf software bouwen en beheren.

### Leeswijzer

- Hoofdstuk 1 verwijst naar de onderdelen van het afsprakenstelsel die je vooraf leest.
- Hoofdstuk 2 beschrijft wat er verandert ten opzichte van het estafettemodel dat je nu in productie hebt: het procesconcept, de inhoudelijke wijzigingen in het informatiemodel, en de gegevensmapping op hoofdlijnen.
- Hoofdstuk 3 beschrijft de implementatiestappen in de aanbevolen volgorde.
- Hoofdstuk 4 beschrijft het testen.
- Hoofdstuk 5 bevat de openstaande punten en aannames die we nog toetsen.


## 1. Inleiding

Deze implementatiehandleiding beschrijft hoe je systemen aansluit op het iWlz-netwerkmodel. De handleiding is bedoeld voor softwareleveranciers en voor zorgaanbieders die zelf software ontwikkelen en beheren. De specificaties (informatiemodel en ondersteunende documentatie) staan op [iStandaarden](https://www.istandaarden.nl/domain/iwlz).

Het Afsprakenstelsel iWlz-netwerkmodel beschrijft de afspraken, architectuur en technische specificaties die nodig zijn om het iWlz-netwerkmodel te implementeren, te beheren en te laten functioneren. Lees voor implementatie in ieder geval:

- [Introductiepagina](https://istandaarden.github.io/Afsprakenstelsel-iWlz/)
- [Achtergrond en toelichting](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/inleiding/achtergrond_toelichting/)
- [Randvoorwaarden](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/organisatiebeleid/randvoorwaarden/)
- [Ontwerpkeuzes](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/organisatiebeleid/ontwerpkeuzes/)
- [Uitwisselprofiel Indicatie](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/uitwisselprofiel/uitwisselprofiel_indicatie/)
- [Uitwisselprofiel Bemiddeling](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/uitwisselprofiel/uitwisselprofiel_bemiddeling/)

Zodra het Uitwisselprofiel Levering gereed is, geldt deze leeslijst ook daarvoor. Dit profiel is nu nog in ontwikkeling.




