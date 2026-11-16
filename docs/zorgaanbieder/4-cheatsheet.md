# Samenvatting implementatiestappen


<style>
  .mermaid-zoom-blok { --mermaid-zoom-hoogte: 2000px; }
</style>

```mermaid
---
config:
  layout: dagre
---
flowchart TD
    subgraph FUNDERING["Fundering"]
        subgraph S1["1. Aansluiten"]
            A1["<b>VECOZO-aansluiting</b><br/>Systeemcertificaten (test + productie)<br/><i>§2.2</i>"]
            A2["<b>IWlz-netwerk</b><br/>IP-registratie<br/><i>§2.3</i>"]
            A3["<b>Tijdelijk adresboek</b><br/>Endpoint-registratie<br/><i>§2.4</i>"]
            A1 --> A2 --> A3
        end
        B["<b>2. Autoriseren</b><br/>Tokens namens zorgaanbieder (AGB, actor)<br/>Juiste scopes en audience<br/>Verkeer via de PEP<br/><i>§2.5</i>"]
        A3 --> B
    end

    subgraph FUNCTIONEEL["Functionele inrichting"]
        C["<b>3. Notificaties ontvangen</b><br/>Resource-endpoint voor notificaties<br/>Bemiddelingsregister, later Leveringsregister<br/><i>§2.6.1</i>"]
        D["<b>4. Raadplegen</b><br/>GraphQL-client<br/>Bemiddelingsregister → wlzIndicatieID → Indicatieregister<br/>Query-templates, GraphQL-over-HTTP<br/><i>§2.7</i>"]
        subgraph S5["5. Leveringsregister vullen en notificeren"]
            E1["<b>Notificatie verzenden</b><br/>Notificaties versturen<br/><i>§2.6.2</i>"]
            E2["<b>Leveringsregister inrichten</b><br/>Zorglevering registreren<br/><i>§2.8</i>"]
            E3["<b>Initieel vullen</b><br/>Leveringsregister vullen<br/><i>§2.9</i>"]
            E1 --> E2 --> E3
        end
        F["<b>6. Melden</b><br/>Foutmeldingen afhandelen<br/>Alleen bronhouder registreert melding-endpoint<br/><i>§2.6.3</i>"]
        C --> D --> E1
        E3 --> F
    end

    subgraph DWARS["Overkoepelend"]
        G["<b>7. Foutafhandeling</b><br/>Synchrone respons en foutmelding<br/>i.p.v. retourbericht<br/><i>§2.10</i>"]
        H["<b>8. Tracelogging</b><br/>X-B3-TraceId<br/>X-B3-SpanId<br/><i>§2.11</i>"]
    end

    subgraph AFRONDING["Afronding"]
        I["<b>9. Testen</b><br/>Testomgeving en testcertificaat<br/>Fictieve BSN's<br/>Onboarding-testdataset<br/><i>§3</i>"]
        J["<b>10. Berichten uitfaseren</b><br/>AW33/AW34 genereren en verwerken<br/>AW35/AW36 genereren en verwerken<br/>AW39/AW310 vervalt"]
        I --> J
    end

    B --> C
    F --> I
    G -.-> C
    G -.-> D
    G -.-> E1
    G -.-> F
    H -.-> C
    H -.-> D
    H -.-> E1
    H -.-> F

    click A1 href "../2-implementatiestappen/#22-aansluiten-bij-vecozo" "Naar §2.2 Aansluiten bij VECOZO" _blank
    click A2 href "../2-implementatiestappen/#23-aansluiten-op-het-iwlz-netwerk" "Naar §2.3 Aansluiten op het IWlz-netwerk" _blank
    click A3 href "../2-implementatiestappen/#24-aansluiten-op-het-tijdelijk-adresboek" "Naar §2.4 Aansluiten op het tijdelijk adresboek" _blank
    click B href "../2-implementatiestappen/#25-autorisatie-inrichten" "Naar §2.5 Autorisatie inrichten" _blank
    click C href "../2-implementatiestappen/#261-notificaties-ontvangen" "Naar §2.6.1 Notificaties ontvangen" _blank
    click D href "../2-implementatiestappen/#27-inrichten-raadplegen" "Naar §2.7 Inrichten raadplegen" _blank
    click E1 href "../2-implementatiestappen/#262-notificeren-verzenden-van-een-notificatie" "Naar §2.6.2 Notificeren" _blank
    click E2 href "../2-implementatiestappen/#28-inrichten-van-het-leveringsregister" "Naar §2.8 Inrichten van het Leveringsregister" _blank
    click E3 href "../2-implementatiestappen/#29-initieel-vullen-van-het-leveringsregister" "Naar §2.9 Initieel vullen" _blank
    click F href "../2-implementatiestappen/#263-melden" "Naar §2.6.3 Melden" _blank
    click G href "../2-implementatiestappen/#210-foutafhandeling" "Naar §2.10 Foutafhandeling" _blank
    click H href "../2-implementatiestappen/#211-logging-en-tracing" "Naar §2.11 Logging en tracing" _blank
    click I href "../3-testen/" "Naar §3 Testen" _blank

    classDef fundering fill:#e8f1fb,stroke:#2b6cb0,color:#1a365d
    classDef functioneel fill:#e6f6ec,stroke:#2f855a,color:#1c4532
    classDef dwars fill:#fff4e0,stroke:#c05621,color:#7b341e
    classDef afronding fill:#f3e8fb,stroke:#6b46c1,color:#44337a
    class A1,A2,A3,B fundering
    class C,D,E1,E2,E3,F functioneel
    class G,H dwars
    class I,J afronding
```

!!! note  
    Let op: tijdens de overgangsfase: wanneer niet alle aanbieders zijn aangesloten op het netwerkmodel, blijft [Silvester](https://istandaarden.github.io/Afsprakenstelsel-iWlz/current/applicatie/silvester/) voor niet-aangesloten partijen AW33-berichten genereren.   
    Zie: Wat verandert er > [§1.1](./1-wat-verandert-er.md#11-van-estafette-naar-netwerk), en : Implementatiestappen > [§2.1](./2-implementatiestappen.md#21-controleer-of-je-systeem-netwerkmodel-proof-is).