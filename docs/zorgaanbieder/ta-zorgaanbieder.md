## Implementatiehandleiding technische aansluiting zorgaanbieder

> ℹ️
> In dit artikel beschrijven we de onderdelen die nodig zijn om als zorgaanbieder aan te sluiten op het iWlz-netwerk. De handleiding is geschreven voor softwareleveranciers en voor zorgaanbieders die zelf software bouwen en beheren.

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

## 2. Wat verandert er voor de zorgaanbieder (en diens softwareleverancier)?

### 2.1 Van estafette naar netwerk

Vandaag werk je in het **estafettemodel** (iWlz 2.4 in productie). Daarin geven partijen berichten als een estafettestokje aan elkaar door, en elk inhoudelijk bericht kent een verplicht retourbericht:

- Het zorgkantoor stuurt je de toewijzing met **AW33** (retour **AW34**).
- Je meldt de aanvang van zorg met **AW35** (retour **AW36**).
- Je meldt mutaties en beëindiging met **AW39** (retour **AW310**).

In het **netwerkmodel** vervalt dit berichtenverkeer. In plaats daarvan staan actuele gegevens in registers die je raadpleegt als je daartoe geautoriseerd bent. Je ontvangt een notificatie over nieuwe of gewijzigde informatie, en je vult zelf het Leveringsregister.

```mermaid
---
config:
 theme: base
 themeVariables:
 background: "#ffffff"
 primaryColor: "#ffffff"
 primaryTextColor: "#1e3a5f"
 primaryBorderColor: "#d0d7de"
 clusterBkg: "#ffffff"
 clusterBorder: "#d8dee4"
 edgeLabelBackground: "#ffffff"
 lineColor: "#1f4e79"
 fontFamily: "Helvetica, Arial, sans-serif"
---
flowchart TB
 subgraph EST["ESTAFETTEMODEL &middot; iWlz 2.4 (productie)"]
 direction LR
 ZK["Zorgkantoor"]
 ZA1["Zorgaanbieder"]
 ZK -- "AW33 &middot; AW35 &middot; AW39-toewijzing &middot; aanvang &middot; mutatie" --> ZA1
 ZA1 -. "AW34 &middot; AW36 &middot; AW310-retourbericht" .-> ZK
 CAP1["puntsgewijze berichten, verplicht retour, vaste volgorde"]
 end

 subgraph NET["NETWERKMODEL"]
 direction LR
 ZA2["Zorgaanbieder"]
 BEM[("Bemiddelingsregister")]
 IND[("Indicatieregister")]
 LEV[("Leveringsregister")]
 ZA2 -- "raadplegen" --> BEM
 ZA2 -- "raadplegen &middot; wlzIndicatieID" --> IND
 ZA2 -- "registreren" --> LEV
 BEM -. "notificatie" .-> ZA2
 CAP2["Notificatie uit het Leveringsregister naar zorgkantoor of andere zorgaanbieder."]
 end

 EST ==> NET

 classDef actor fill:#1e3a5f,stroke:#1e3a5f,color:#ffffff,font-weight:bold
 classDef register fill:#eaf2fb,stroke:#1f4e79,color:#1f4e79,font-weight:bold
 classDef caption fill:none,stroke:none,color:#333333,font-size:13px
 class ZK,ZA1,ZA2 actor
 class BEM,IND,LEV register
 class CAP1,CAP2 caption

 linkStyle 0,1 stroke:#c2185b,color:#c2185b,font-weight:bold
 linkStyle 5 stroke:#b8860b,color:#b8860b,font-weight:bold
```
Figuur 1 - Estafettemodel versus netwerkmodel: berichten met retour worden registers met notificaties

De procesveranderingen ten opzichte van het estafettemodel:

1. De AW33 vervalt. De toewijzingsinformatie staat in het Indicatie- en Bemiddelingsregister. De zorgaanbieder raadpleegt deze informatie. In plaats van de AW33 ontvangt de zorgaanbieder een notificatie.
2. De regiehouder (dossierhouder of coördinator zorg thuis) is actueel raadpleegbaar in het Bemiddelingsregister, inclusief tussentijdse wisselingen. In het estafettemodel zijn die tussentijdse wisselingen niet beschikbaar.
3. De informatieve zorgtoewijzing is raadpleegbaar. Het zorgkantoor verstuurt deze toewijzing niet meer automatisch.
4. Het retourbericht (AW34/AW36/AW310) vervalt: een bevestiging op de notificatie en foutmeldingen komen ervoor in de plaats (§3.10).
5. Het XML-bericht is vervangen door een GraphQL-query.
6. Contactgegevens van cliënt en contactpersonen zijn raadpleegbaar in het Bemiddelingsregister, en op termijn in het Leveringsregister.
7. Overlappende leveringen van andere aanbieders zijn met het Leveringsregister raadpleegbaar (LRA0005).
8. Bij een verzoek aan een andere aanbieder ontvangt die aanbieder een notificatie (`NIEUW_VERZOEKAANBIEDER_AANBIEDER`) en kan het verzoek raadplegen.
9. De zorgaanbieder in een andere regio dan het verantwoordelijk zorgkantoor raadpleegt direct de bron van het verantwoordelijk zorgkantoor, in plaats van via het uitvoerend zorgkantoor.

### 2.2 Inhoudelijke wijzigingen in het informatiemodel (los van de overstap op registers)

Naast de overstap van berichten naar registers wijzigen de volgende zaken inhoudelijk. De tabel hieronder vergelijkt estafette (iWlz 2.4) en netwerkmodel.

| **Onderwerp** | **Estafette (iWlz 2.4)** | **Netwerkmodel** |
| --- | --- | --- |
| Actualiteit van gegevens | AW33 is een volledige momentopname van alle geldige toewijzingen (OP087) | Registerstand, raadpleegbaar op het moment van bevraging |
| Bevestiging en foutafhandeling | Verplicht retourbericht (AW34/AW36/AW310) binnen één werkdag (OP090); alles-of-niets per cliënt (OP093); correctie binnen één werkdag (OP180) | Synchrone respons op de aanroep; bevestiging op de notificatie; foutmelding `IWLZFOUTMELDING` (§3.10) |
| Informatieve toewijzing | Broadcast van AW33 naar alle betrokken aanbieders, met informatieve toewijzingen (OP032, OP318) | Raadpleegbaar in het register; notificatie `INFORMATIEVE_BEMIDDELINGSPECIFICATIE_ZORGAANBIEDER` |
| Bovenregionaal verkeer | Doorstuurberichten tussen zorgkantoren (ZK33/ZK34, ZK35/ZK36, ZK39/ZK310) | Geen doorstuurberichten; raadpleging bij de bron van het verantwoordelijk zorgkantoor |
| Berichtspecifieke velden | `Mutatiecode`, `Mutatiedatum`, `Toewijzingstijd`, `StatusAanlevering` (correctiemechanisme OP033); `Etmalen`, `Sleuteldatum` | Vervallen of vervangen door registerstand en notificatie; `Etmalen` en `Sleuteldatum` kennen LR-equivalenten (`vaststellingMoment`, `sleuteldatum`) |

### 2.3 Gegevensmapping op hoofdlijnen

De gegevens uit je huidige AW-berichten verdelen zich over drie registers. Gebruik voor de exacte, veld-voor-veld vergelijking de mappingdocumentatie van iStandaarden.

| **Estafette-bericht** | **Belangrijkste inhoud** | **Netwerkmodel-bestemming** |
| --- | --- | --- |
| **AW33** (toewijzing, ZK → ZA) | Volledige cliënt-snapshot: `Client`, `Indicatie`, `Stoornis`, `Beperking`, `GeindiceerdZorgzwaartepakket`, `ToegewezenZorgzwaartepakket` (incl. `Dossierhouder`, `CoordinatorZorgThuis`) | Indicatiegegevens → **Indicatieregister** (WlzIndicatie); toewijzing/bemiddeling → **Bemiddelingsregister** (Bemiddeling, Bemiddelingspecificatie, Regiehouder) |
| **AW35** (aanvang, ZA → ZK) | `GeleverdZorgzwaartepakket`: `Begindatum`, `Sleuteldatum`, `Leveringsstatus`, `Etmalen`, `Behandeling` | **Leveringsregister** (Leveringperiode, Behandelingperiode) |
| **AW39** (mutatie/beëindiging + aanvraag, ZA → ZK) | `MutatieZorgzwaartepakket` (mutatie/einde, leveringsstatus) en `Aanvraag` + `AanvraagInstelling` (aanvraag aangepaste toewijzing) | **Leveringsregister** (Uitstelperiode, Afstel, Verzoek, VerzoekAanbieder) |
| **AW34 / AW36 / AW310** (retour) | Ontvangstbevestiging en retourcodes | Vervalt: bevestiging op de notificatie + foutmelding (§3.10) |

De officiële, gedetailleerde mapping voor de toewijzing is de Excel **"Mapping Bemiddelingsregister - AW33"** (versie 1.4.2, 19 juni 2025) bij de release [iWlz Bemiddelingsregister 1](https://www.istandaarden.nl/domain/iwlz/specificaties/release-1). Deze mapping beschrijft hoe de gegevens uit het Indicatieregister én het Bemiddelingsregister overeenkomen met de AW33. De mapping is gebaseerd op de GraphQL-koppelvlakken Indicatieregister 1.4 en Bemiddelingsregister 1.1.0 en de AW33-schemadefinitie (iWlz 2.4.3).

> ℹ️
> De AW33-mapping dekt **beide** registers. Het tabblad AW33 bevat een kolom "Register" die elk AW33-veld toewijst aan het Indicatieregister of het Bemiddelingsregister. In versie 1.4.2 mapt de mapping circa 78 velden naar het **Indicatieregister** (waaronder alle BRP-cliëntgegevens, en het cliëntadres en telefoon) en circa 57 naar het **Bemiddelingsregister** (waaronder contactpersonen, regiehouder en de toewijzing zelf). Je hoeft dus geen aparte indicatie-mapping te maken: het Indicatieregister zit al in dit bestand, en is qua omvang zelfs de grootste bron. De twee uitgangspunten in de mapping: BRP-cliëntgegevens komen uit het Indicatieregister. Contactinformatie van de cliënt en relatiegegevens komen uit het Bemiddelingsregister. Het `wlzIndicatieID` blijft daarnaast het sleutelveld waarmee je vanuit het Bemiddelingsregister de actuele indicatie-inhoud in het Indicatieregister raadpleegt (zie §3.7).

### 2.4 Samenvatting van de benodigde aanpassingen

Hieronder staat wat een softwareleverancier aanpast of bouwt, met verwijzing naar de stappen in hoofdstuk 3. Dit is de volledige scope, niet alleen het wegvallen van de berichten.

- **Aansluiten.** VECOZO-aansluiting, systeemcertificaten (test en productie), IP-registratie, en endpoint-registratie in het tijdelijk adresboek (§3.2, §3.3, §3.4).
- **Autoriseren.** Tokens aanvragen namens de zorgaanbieder op AGB-basis (actor), met de juiste scopes en audience; al het verkeer loopt via de PEP (§3.5).
- **Notificaties ontvangen.** Een resource-endpoint voor notificaties uit het Bemiddelingsregister, en op termijn uit het Leveringsregister (§3.6.1).
- **Raadplegen.** Een GraphQL-client voor de keten Bemiddelingsregister -> `wlzIndicatieID` -> Indicatieregister, conform de query-templates en GraphQL-over-HTTP (§3.7).
- **Leveringsregister vullen en notificeren.** De zorglevering registreren en de bijbehorende notificaties versturen (§3.6.2, §3.8, §3.9).
- **Melden.** Foutmeldingen afhandelen; alleen de bronhouder registreert een melding-endpoint (§3.6.3).
- **Foutafhandeling.** Synchrone respons en foutmelding in plaats van het retourbericht (§3.10).
- **Tracelogging.** `X-B3-TraceId` en `X-B3-SpanId` conform RFC0022a (§3.11).
- **Testen.** Testomgeving, testcertificaat, fictieve BSN's en een onboarding-testdataset (§4).
- **Berichten uitfaseren.** Genereren en verwerken van AW33/AW34, AW35/AW36 en AW39/AW310 vervalt. Let op de overgangsfase: zolang niet alle aanbieders zijn aangesloten, blijft [Silvester](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/silvester/) voor niet-aangesloten partijen AW33-berichten genereren (§2.1, §3.1).

## 3. Implementatiestappen

Deelname aan het iWlz-netwerkmodel vereist de onderstaande stappen, in de aanbevolen volgorde.

### 3.1 Controleer of je systeem netwerkmodel-proof is

Vergelijk je huidige estafette-implementatie met het netwerkmodel. Pas je software waar nodig aan. Gebruik daarvoor concreet:

1. **Gegevens (veld-voor-veld):** de mapping **"Mapping Bemiddelingsregister - AW33"** bij [iWlz Bemiddelingsregister 1](https://www.istandaarden.nl/domain/iwlz/specificaties/release-1). Hierin staat hoe de gegevens uit het Indicatie- en Bemiddelingsregister overeenkomen met de AW33.
2. **Informatiemodel (concepten):** vergelijk het [estafette-informatiemodel iWlz 2.4](https://informatiemodel.istandaarden.nl/informatiemodel/iwlz/estafette/2.4/) dat je nu in productie hebt met de netwerkmodel-registers ([Bemiddelingsregister 1](https://informatiemodel.istandaarden.nl/informatiemodel/iwlz/netwerk/bemiddelingsregister-1/), [Indicatieregister](https://informatiemodel.istandaarden.nl/informatiemodel/iwlz/netwerk/indicatieregister-2/), [Leveringsregister 1](https://informatiemodel.istandaarden.nl/informatiemodel/iwlz/netwerk/leveringsregister-1/)). Het overzicht in §2.2 helpt bij de inhoudelijke verschillen.
3. **Proces en regels:** beoordeel of je procesafhandeling past bij het wegvallen van de estafette-volgorde en de retourberichten (§2.1 en §3.10).

### 3.2 Aansluiten bij VECOZO

Gebruik van het iWlz-netwerk vereist aansluiting bij VECOZO. De vereisten staan in [Aansluiten bij VECOZO](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/diensten/toetreden/#2-aansluiten-bij-vecozo/) van het artikel Toetreden. Voor het aansluiten heb je onder andere een KvK-nummer, een AGB-code en een ondertekende aansluitovereenkomst (OVK) met VECOZO nodig. Ook moet de zorgorganisatie voldoen aan NEN 7510.

Softwareleveranciers en zorginkoopbemiddelaars hoeven niet zelf NEN 7510-gecertificeerd te zijn en hoeven geen eigen AGB-code aan te leveren; de zorgorganisatie die hun software gebruikt blijft verantwoordelijk.

Een organisatie die al via een OVK bij VECOZO is aangesloten, moet vooralsnog een nieuw systeemcertificaat aanvragen voor het iWlz-netwerk. Het bestaande systeemcertificaat kun je niet hergebruiken. De geregistreerde IP-adressen en de toestemmingsverklaring kun je mogelijk wel hergebruiken. Of hergebruik van het certificaat later toch mogelijk wordt, toetsen we nog. Let op: voor het iWlz-netwerk heb je een apart test- en productiecertificaat nodig. Ook meld je je resource-server-endpoints aan (zie §3.3 en §3.4).

### 3.3 Aansluiten op het iWlz-netwerk

Na aansluiting bij VECOZO sluit je aan op het iWlz-netwerk. De vereisten staan in [Aansluiten op het iWlz-netwerk](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/diensten/toetreden/#3-aansluiten-op-het-iwlz-netwerk) van het artikel Toetreden. De technische aansluiting kent de volgende substappen:

1. Systeemcertificaten aanvragen bij VECOZO (voor zowel test- als productieomgeving).
2. Systeemcertificaten installeren.
3. IP-adressen vastleggen bij het systeemcertificaat in de VECOZO-portal.
4. Resource-server-endpoints aanmelden in het tijdelijk adresboek (zie §3.4).
5. Toestemmingsverklaring instellen (voor softwareleveranciers en zorginkoopbemiddelaars).

### 3.4 Aansluiten op het tijdelijk adresboek

Het adresboek bevat de endpoints die aangeven waar notificaties en meldingen naartoe moeten en waar informatie kan worden geraadpleegd. Omdat het zorgadresboek (Zorg-AB) nog niet beschikbaar is, is er een tijdelijk adresboek:

[github.com/iStandaarden/iWlz-adresboek-public](https://github.com/iStandaarden/iWlz-adresboek-public)

De softwareleverancier van de zorgaanbieder moet voor aansluiting op het Bemiddelingsregister notificatie-endpoints aanmelden. Zo weet bijvoorbeeld het zorgkantoor bij registratie van een Bemiddelingspecificatie (toewijzing) waar de notificatie naartoe moet. Zodra de softwareleverancier ook het Leveringsregister aansluit, levert hij ook de resource-endpoints en meldingen-endpoints voor het Leveringsregister aan.

**Wijze van aanmelden.** De publieke repo bevat geen self-serviceregistratie. De actuele adreslijst staat in een afgeschermde repo (`iWlz-adresboek-private`). Aanmelden en wijzigen gaat via de servicedesk iStandaarden:

- E-mail: [info@istandaarden.nl](mailto:info@istandaarden.nl)
- Contactpersonen: Dennis de Gouw en Remo van Rest
- Toegang tot de private repo vraag je aan met het bericht "Aanvraag toegang iWlz Adresboek private". Vermeld daarbij je organisatie en GitHub-account.

**Structuur van een adresboek-entry.** Elke `electronicService` heeft een `gegevensdienstId` volgens de conventie `[OrganisatieID]_[Functionaliteit]_[Omgeving]` (bijvoorbeeld `CIZ_INDICATIE_TST`), een `weergavenaam`, een `description` en drie endpoint-blokken:

- `authorizationEndpoint.authorizationEndpointuri` (de PEP, zie §3.5)
- `tokenEndpoint.tokenEndpointuri` (de autorisatieserver)
- `systeemrollen[]` met een `systeemrolcode` en een `resourceEndpoint.resourceEndpointuri` (de eigenlijke dienst)

```json
{ 
    "electronicServices": [ 
        { 
            "description": "TEST OMGEVING Voor het raadplegen van het Wlz Indicatieregister", 
            "gegevensdienstId": "CIZ_INDICATIE_TST", 
            "weergavenaam": "TEST OMGEVING - Wlz Indicatieregister", "authorizationEndpoint": { "authorizationEndpointuri": "https://<pep-url>/" }, 
            "tokenEndpoint": { "tokenEndpointuri": "https://<autorisatieserver-url>/" },
            "systeemrollen": [ 
                { "systeemrolcode": "Register", 
                "resourceEndpoint": { "resourceEndpointuri": "https://<graphql-endpoint>/" } 
                 } 
            ] 
        } 
    ] 
}
```
> ℹ️
> Registreer per AGB-code de relevante endpoints in het tijdelijk adresboek. Neem hiervoor contact op met iStandaarden.

### 3.5 Autorisatie inrichten

Voor notificeren, melden en raadplegen is autorisatie nodig. Je vraagt een access-token (JWT) aan bij de autorisatieserver met een authenticatiemiddel, een of meer scopes en een audience. De flow is OAuth 2.0 Client Credentials.

```mermaid
---
config:
  theme: base
  themeVariables:
    background: "#ffffff"
    primaryColor: "#f2f6fb"
    primaryTextColor: "#154273"
    primaryBorderColor: "#c3cedc"
    actorTextColor: "#154273"
    signalColor: "#154273"
    signalTextColor: "#154273"
    fontFamily: "Helvetica, Arial, sans-serif"
  sequence:
    actorMargin: 90
    messageAlign: center
    mirrorActors: false
---
sequenceDiagram
    autonumber
    participant C as Client
    participant AS as Autorisatieserver
    participant PEP as PEP
    participant PDP as PDP
    participant REG as Register
    C ->> AS: token-aanvraag (scope + audience)
    AS -->> C: access-token (sub = agbcode, exp 1u)
    C ->> PEP: GraphQL + Bearer-token
    rect rgb(235, 245, 233)
        PEP ->> PDP: beoordeel grondslag
        PDP -->> PEP: toegestaan / geweigerd
    end
    PEP ->> REG: doorgezet + claims-header
    REG -->> PEP: respons
    PEP -->> C: respons
```
Figuur 2 - Autorisatie en raadplegen via de PEP

**Acteren namens de zorgaanbieder (AGB-actor).** Een softwareleverancier of intermediair handelt namens de zorgaanbieder via het actor-mechanisme. Een zorgaanbieder wordt geïdentificeerd met een AGB-code (een zorgkantoor met een UZOVI-code). In het access-token staat de zorgaanbieder daarom als `sub = agbcode:012345678`. Het token is maximaal één uur geldig. Voor meer informatie zie [nID netwerkstelsel, 3. Autoriseren](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/nid_netwerkstelsel/#3-autoriseren).

**Scopes.** Een scope is opgebouwd uit het resource-type en de benodigde toegang. Voor de zorgaanbieder zijn dit de relevante scopes:

| **Doel** | **Scope** |
| --- | --- |
| Indicatieregister raadplegen | `registers/wlzindicatieregister/indicaties:read` |
| Bemiddelingsregister raadplegen | `registers/wlzbemiddelingsregister/bemiddelingen/bemiddeling:read` |
| Notificatie aan een zorgaanbieder | `organisaties/zorgaanbieder/notificaties/notificatie:create` |
| Melding aan een zorgaanbieder | `organisaties/zorgaanbieder/meldingen/melding:create` |

De specifieke scopes staan ook in de uitwisselprofielen: [Uitwisselprofiel Indicatie, §8.2](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/uitwisselprofiel/uitwisselprofiel_indicatie/#82-nid-netwerkstelsel-scopes) en [Uitwisselprofiel Bemiddeling, §8.2](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/uitwisselprofiel/uitwisselprofiel_bemiddeling/#82-nid-netwerkstelsel-scopes). Gebruik je een scope die niet is toegekend, dan krijg je "Access denied, invalid scope".

**Audience en PEP.** Je moet precies één audience opgeven, als geldige https-URL. De audience is de afgeschermde `resourceEndpointuri` van de resource-server, die alleen de Policy Enforcement Point (PEP) van die resource-server vertrouwt. Je raadpleegt het register dus nooit rechtstreeks: al het verkeer loopt via de PEP. De PEP valideert de grondslag (samen met de PDP) en zet het verzoek door naar de resource-server. De audience-URL herken je in het adresboek aan de tag `resourceEndpointuri`.

De PEP-endpoints zijn:

- Testomgeving: `https://tst-api.vecozo.nl/tst/netwerkmodel/v3/pep`
- Productieomgeving: `https://api.vecozo.nl/netwerkmodel/v3/pep`

### 3.6 Inrichten Notificeren en Melden

Het netwerkmodel ondersteunt het hele iWlz-ketenproces. Daarvoor moet een ketenpartij soms relevante informatie ontvangen. Zo komt de voortgang van de zorglevering niet in gevaar. Voor meer informatie zie [Notificeren en Melden](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/diensten/notificeren-en-melden/). Notificeren en melden zijn technisch identiek opgebouwd als GraphQL-mutaties (`zendNotificatie` en `zendMelding`); het generieke schema staat in [iWlz-generiek](https://github.com/iStandaarden/iWlz-generiek).

#### 3.6.1 Notificaties ontvangen

Een notificatie wijst een deelnemer van het netwerkmodel op nieuwe of gewijzigde informatie die relevant is voor die deelnemer. Aan de hand van de inhoud van de notificatie weet je wat er speelt en doe je een gerichte raadpleging op het register.

Een zorgaanbieder ontvangt notificaties uit het **Bemiddelingsregister**, en op termijn uit het **Leveringsregister**. Daarmee kun je informatie in het Bemiddelingsregister raadplegen, en via het daarin opgehaalde `wlzIndicatieID` ook het Indicatieregister (zie §3.7). Je ontvangt geen notificaties uit het Indicatieregister; de twee indicatie-notificaties gaan naar het zorgkantoor.

Om notificaties te ontvangen, moet je een notificatie-endpoint registreren (zie §3.4).

**Te ontvangen notificaties uit het Bemiddelingsregister** (zie [iWlz-bemiddeling, Bemiddelingsregister-1/notificaties](https://github.com/iStandaarden/iWlz-bemiddeling/blob/Bemiddelingsregister-1/notificaties/README.md)):

| **Notificatie** | **Type** |
| --- | --- |
| `NIEUWE_BEMIDDELINGSPECIFICATIE_ZORGAANBIEDER` | Verplicht |
| `GEWIJZIGDE_BEMIDDELINGSPECIFICATIE_ZORGAANBIEDER` | Verplicht |
| `VERWIJDERDE_BEMIDDELINGSPECIFICATIE_ZORGAANBIEDER` | Verplicht |
| `NIEUWE_REGIEHOUDER_ZORGAANBIEDER` | Verplicht |
| `GEWIJZIGDE_REGIEHOUDER_ZORGAANBIEDER` | Verplicht |
| `VERWIJDERDE_REGIEHOUDER_ZORGAANBIEDER` | Verplicht |
| `INFORMATIEVE_BEMIDDELINGSPECIFICATIE_ZORGAANBIEDER` | Verplicht |

**Te ontvangen notificatie uit het Leveringsregister** (zie [iWlz-levering, Leveringsregister-1/notificaties](https://github.com/iStandaarden/iWlz-levering/tree/Leveringsregister-1/notificaties)):

| **Notificatie** | **Type** |
| --- | --- |
| `NIEUW_VERZOEKAANBIEDER_AANBIEDER` | Verplicht |

Deze notificatie ontvang je als er voor jouw instelling een verzoek (`VerzoekAanbieder`) is opgenomen door een aanbieder met de regierol.

#### 3.6.2 Notificeren: verzenden van een notificatie

Met de dienst **Notificeren** breng je een deelnemer op de hoogte dat er voor die deelnemer relevante informatie beschikbaar is. Voor de inrichting zie [Notificeren en Melden, 3. Notificaties](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/diensten/notificeren-en-melden/#3-notificaties).

Als zorgaanbieder verstuur je notificaties wanneer je gegevens registreert in het Leveringsregister. De volledige lijst staat in [Notificaties Leveringsregister](https://github.com/iStandaarden/iWlz-levering/tree/Leveringsregister-1/notificaties). Op hoofdlijnen:

- Aan het zorgkantoor: nieuwe, gewijzigde en verwijderde `LEVERINGPERIODE`, `BEHANDELINGPERIODE`, `UITSTELPERIODE` en `AFSTEL`, en `NIEUW_VERZOEK_ZORGKANTOOR`.
- Aan een andere zorgaanbieder: `NIEUW_VERZOEKAANBIEDER_AANBIEDER` (zie ook §3.6.1).

> ℹ️
> De notificatie die het leveringsproces voor jou start (een nieuwe Bemiddelingspecificatie/toewijzing) komt uit het Bemiddelingsregister, niet uit het Leveringsregister.

#### 3.6.3 Melden

Andersom kun je de bronhouder voorzien van nieuwe informatie. Dat heet **Melden** (deelnemer naar bronhouder). Voor de inrichting zie [Notificeren en Melden, 4. Meldingen](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/diensten/notificeren-en-melden/#4-meldingen).

In de eerste implementatie is alleen de **foutmelding** uitgewerkt (`eventType: IWLZFOUTMELDING`). Deze foutmelding vervangt het oude foutbericht uit het estafettemodel (zie §3.10). Meldingen vervangen op dit moment alleen foutberichten. Daarom registreert alleen de bronhouder een melding-endpoint. Word je zelf bronhouder van het Leveringsregister, dan registreer je daarvoor een melding-endpoint (zie §3.4).

### 3.7 Inrichten Raadplegen

Je raadpleegt een register met een GraphQL-query. Als de raadpleging aan de autorisatie en aan het toegestane patroon voldoet, ontvang je de gegevens terug. Voor meer informatie zie [Raadplegen](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/graphql_over_http/) en [GraphQL over HTTP](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/graphql_over_http/#graphql-over-http).

Per register zijn er raadpleeg-use-cases met bijbehorende query-templates. Wijkt je query af van dit patroon, dan keurt de resource-server de query af. De use-cases vind je via de [Uitwisselprofielen](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/uitwisselprofiel/#uitwisselprofielen).

**De raadpleeg-keten voor de zorgaanbieder.** De toegang tot het Indicatieregister loopt via het Bemiddelingsregister: uit het Bemiddelingsregister haal je het `wlzIndicatieID` (de sleutel), en de bemiddelingspecificatie waarin jouw instelling staat is tegelijk de autorisatiegrondslag voor de indicatie-raadpleging.

```mermaid
---
config:
  theme: base
  themeVariables:
    background: "#ffffff"
    primaryColor: "#eaf4fb"
    primaryTextColor: "#154273"
    primaryBorderColor: "#005c96"
    lineColor: "#475569"
    edgeLabelBackground: "#ffffff"
    fontFamily: "Helvetica, Arial, sans-serif"
---
flowchart TB
    NOT["Notificatie uit Bemiddelingsregister"]
    OVL["Overlap + contactgegevens<br/>UCBR-0002_3 &middot; QBR-0002/0003-ZA"]
    BR["<b>1 &middot; Bemiddelingsregister raadplegen</b><br/>UCBR-0001 &middot; QBR-0001-ZA<br/>input: bemiddelingspecificatieID + eigen AGB"]
    RGH["Regiehouder<br/>QBR-0009-ZAr"]
    IR["<b>2 &middot; Indicatieregister raadplegen</b><br/>UCIR-0002 &middot; QIR-0002-ZA<br/>input: wlzIndicatieID"]
    NOT --> BR
    BR -.-> OVL
    BR -- "levert wlzIndicatieID" --> IR
    BR -.-> RGH
    classDef notificatie fill:#fbf3c5,stroke:#d9be45,color:#0f172a,font-weight:bold
    classDef stap fill:#eaf4fb,stroke:#005c96,color:#154273
    classDef zijtak fill:#f2f6fb,stroke:#c3cedc,color:#0f172a
    class NOT notificatie
    class BR,IR stap
    class OVL,RGH zijtak
    linkStyle 2 stroke:#005c96,color:#005c96,font-weight:bold
```
Figuur 3 - Raadpleeg-keten zorgaanbieder: Bemiddelingsregister naar Indicatieregister

Beschikbare query-templates voor de actor zorgaanbieder:

- Bemiddelingsregister: `QBR-0001-ZA` (eigen bemiddelingspecificatie), `QBR-0002-ZA` en `QBR-0003-ZA` (overlap en contactgegevens), `QBR-0009-ZAr` (regiehouder).
- Indicatieregister: `QIR-0002-ZA` (Wlz-indicatie op basis van `wlzIndicatieID`).
- Leveringsregister: `QLR-0001-ZA`, `QLR-0001_1-ZA`, `QLR-0001_2_ZA` (levering), `QLR-0002-ZA` (VerzoekAanbieder).

Let bij het bouwen op de eisen uit [GraphQL over HTTP](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/graphql_over_http/#graphql-over-http) en §3.10.

### 3.8 Inrichten van het Leveringsregister

Het [Leveringsregister 1](https://www.istandaarden.nl/algemeen/over-leveringsregister-1-0) is het register waarin je als zorgaanbieder de zorglevering registreert. Het vervangt de berichten **AW35** (aanvang) en **AW39** (mutatie en beëindiging, inclusief de aanvraag aangepaste toewijzing).

> ⚠️
> Het Leveringsregister 1 is op dit moment een **Release Candidate** (versie 1.0-rc1, 29-01-2026). De raadpleeg-use-cases en toegangscontroles zijn nog als concept gepubliceerd. Schema en queries kunnen nog wijzigen. Houd dit voorbehoud aan bij je implementatie.

Als zorgaanbieder registreer je onder andere de volgende klassen (zie het [informatiemodel Leveringsregister 1](https://informatiemodel.istandaarden.nl/informatiemodel/iwlz/netwerk/leveringsregister-1/)):

- `Client`, `Levering` (gekoppeld aan de toewijzing via `bemiddelingspecificatieID`)
- `Leveringperiode` en `Behandelingperiode` (aanvang en verloop van de levering; vervangt AW35)
- `Uitstelperiode` (wachtlijst- en statusgegevens: `leveringsstatus`, `leveringsstatusClassificatie`)
- `Afstel` (afzien van levering)
- `Verzoek` en `VerzoekAanbieder` (verzoek aangepaste toewijzing aan een andere aanbieder)

Je inzage als raadpleger is read-only en geregeld via de autorisatieregels LRA0005 (leveringstatus bij overlappende toewijzingen van andere aanbieders) en LRA0006 (het Verzoek waarin voor jou een aanvraag is opgenomen).

> ℹ️
> Het GraphQL-koppelvlak van het Leveringsregister 1 beschrijft op dit moment alleen raadplegen (`Query`). Het registreren/vullen is procesmatig beschreven (proces Leveren, gegevens- en invulinstructieregels) en je verstuurt de bijbehorende notificaties (§3.6.2), maar het schrijf-/aanleverkoppelvlak is geen onderdeel van de iStandaarden. Je bent zelf verantwoordelijk voor de vulling van het register.

### 3.9 Initieel vullen van het Leveringsregister

Dit onderdeel is nog in ontwikkeling. Zodra de procedure voor de initiële vulling zijn vastgesteld, werken we dit onderdeel uit.

### 3.10 Foutafhandeling

Het retourbericht uit het estafettemodel (AW34/AW36/AW310) vervalt. Foutafhandeling verloopt nu langs twee lijnen:

1. **Synchrone respons op de aanroep.** Volg de eisen uit [GraphQL over HTTP](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/graphql_over_http/):
   - Verstuur requests via HTTP POST met `Content-Type: application/json`.
   - Het verplichte response-mediatype is `application/graphql-response+json`. Vraag je `application/json` in de accept-header, dan krijg je een `406 Not Acceptable`.
   - Een `200 OK` kan zowel `data` als `errors` bevatten (partieel resultaat); een volledige fout levert een 4xx.
2. **Foutmelding via Melden.** De bronhouder geeft inhoudelijke regelfouten terug als foutmelding met `eventType: IWLZFOUTMELDING`. Waarbij het onderwerp verwijst naar de overtreden gegevensregel- of restrictiecode.

Daarnaast definieert het [nID netwerkstelsel](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/nid_netwerkstelsel/) de autorisatie-/toegangsfouten (onder andere 403 bij ontbrekende grondslag of niet-passende scope).

### 3.11 Logging en tracing

Je houdt als deelnemer een auditlogboek bij (zie nID netwerkstelsel). De PEP zet bij het doorzetten naar de resource-server een claims-header mee, die de resource-server voor logging kan gebruiken. Tracelogging is uitgewerkt in het artikel [Logging](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/it-infrastructuur/logging/). De aanpak is gefaseerd:

- **Fase 1 (van toepassing, ook voor de ketentest).** Voeg aan elk request dat je binnen het netwerkmodel naar een andere dienst stuurt twee headers toe, conform de [B3 Propagation-standaard](https://github.com/openzipkin/b3-propagation):
  - `X-B3-TraceId`: 16 bytes (32 hexadecimale tekens, lowercase), niet uitsluitend nullen, uniek per ketenverzoek.
  - `X-B3-SpanId`: 8 bytes (16 hexadecimale tekens, lowercase), uniek per verwerkingsstap.
  Genereer deze waarden met de [OpenTelemetry SDK](https://opentelemetry.io/docs/) (bijvoorbeeld `@opentelemetry/api` voor Node.js). Ontbreekt een binnenkomende `TraceId`, genereer dan een nieuwe. Voor fase 1 en de ketentest geldt: een nieuwe `TraceId` per afzonderlijke interactie (melding, raadpleging, notificatie); het doorgeven van een bestaande `TraceId` tussen interacties is nog geen vereiste. Voorbeeld:

`X-B3-TraceId: 463ac35c9f6413ad48485a3953bb6124 X-B3-SpanId: 0020000000000001`

- **Fase 2:** uitbreiding met `ParentSpanId` (RFC0022b, voorwaardelijk).

## 4. Testen aansluiting zorgaanbieder

Bij de introductie van een nieuw register vindt een landelijke ketentest plaats, centraal uitgevoerd met ketenpartijen en hun softwareleveranciers. De afspraken staan in het landelijk-ketentestplan wat voorafgaand aan de ketentest wordt verspreid onder de deelnemers die hieraan meedoen.

Partijen die ná de landelijke ketentest aansluiten, organiseren en voeren zelf tests uit met de betrokken ketenpartijen. Zij stemmen inhoud en aanpak onderling af. Er is op dit moment geen centrale coördinatie of vast toetsingsmoment voor individuele aansluitingen.

Concreet voor je testtraject:

- Je hebt een **testcertificaat** nodig (apart van productie, zie §3.3) en gebruikt het TST-PEP-endpoint `https://tst-api.vecozo.nl/tst/netwerkmodel/v3/pep`.
- Gebruik van **productiedata is niet toegestaan**. Zorginstituut Nederland publiceert bij releases een lijst met **fictieve BSN's** voor testdoeleinden.
- Afnemers gebruiken de testomgeving **verplicht bij onboarding**. Bronhouders stellen een testomgeving beschikbaar (zie [Bronhoudersdeel serviceafspraken, §2.1](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/organisatiebeleid/serviceafspraken/bronhoudersdeel/#21-beschikbaar-stellen-testomgeving-door-bronhouders)).
- Voor het raadplegen van het Bemiddelingsregister heb je een geldige notificatie met vooraf geconfigureerde testdata nodig. Welke flow je volgt, hangt af van de data die je eerste query teruggeeft. Zet daarom vooraf een testdataset klaar met de juiste rechten voor de onboarding.
- Loadtesten stem je vooraf af met de operationeel netwerkbeheerder.

Zie voor meer informatie [Testen](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/diensten/testen/).

