# Elektronen im Magnetfeld – 3D-Simulation

Interaktive Three.js-Simulation eines Fadenstrahlrohrs mit Helmholtzspulen für den Physikunterricht. Die Gestaltung orientiert sich am Leybold-Versuchsaufbau zur Ablenkung von Elektronen im Magnetfeld (P3.8.5.1); es werden keine Abbildungen aus der Versuchsanleitung verwendet.

## Start

Voraussetzungen: Node.js (LTS).

```bash
npm install
npm run dev
```

Danach die von Vite angezeigte lokale Adresse im Browser öffnen. Ein Produktionsbuild lässt sich mit `npm run build` erstellen.

## Im Modell untersuchen

- Beschleunigungsspannung und Spulenstrom unabhängig voneinander verändern
- die Richtung des Magnetfeldes umkehren und die Ablenkungsrichtung vergleichen
- die 3D-Ansicht mit Maus oder Touch drehen und mit dem Scrollrad zoomen
- Magnetfeldvektoren ein- und ausblenden
- Feldstärke und Bahnradius als Messwerte ablesen
- Die Netzgeräte im 3D-Versuchsaufbau beobachten; ihre Anzeigen folgen den Reglereinstellungen
- Spulenstrom bis auf 0 A reduzieren und die geradlinige, unabgelenkte Bahn beobachten
- Den Elektronenstrahl als ruhige, kontinuierliche Bahn ohne bewegte Teilchen verfolgen

## Physikalisches Modell

Die beiden Helmholtzspulen erzeugen näherungsweise ein homogenes Magnetfeld:

`B = μ₀ · N · I / R · (4/5)^(3/2)`

Die Elektronen werden aus der Ruhe durch die Beschleunigungsspannung `U` beschleunigt. Aus `e · U = ½ mₑ · v²` und der Lorentzkraft folgt für den Bahnradius:

`r = √(2 mₑ e U) / (e B)`

Für die Messwertanzeige werden 130 Windungen und ein Spulenradius von 18 cm angenommen. Randfelder, Reibung und relativistische Effekte bleiben unberücksichtigt. Die dreidimensionale Darstellung ist schematisch skaliert; Feldstärke und Bahnradius werden aus den physikalischen Größen berechnet.

Bei 0 A ist das Magnetfeld null. Damit wirkt keine Lorentzkraft: Der Elektronenstrahl verläuft gerade, die Feldsymbole verschwinden und der Bahnradius wird als unendlich angezeigt.

Das Fadenstrahlrohr ist als geschlossener Glaszylinder modelliert. Die Bahn wird an der Innenwand oder an einer Stirnfläche beendet; auch bei kleinem Spulenstrom kann sie daher nicht außerhalb des Rohres weiterlaufen.

Das Koordinatenraster erstreckt sich über die gesamte Rohrlänge. Die x-Achse zeigt nach rechts, die y-Achse verläuft senkrecht durch die Rohrmitte.

## Schematischer Versuchsaufbau

Das 3D-Modell zeigt ein waagerechtes Fadenstrahlrohr in zwei parallelen Helmholtzspulen, die Elektronenkanone sowie ein Netzgerät für die Beschleunigungsspannung und eines für den Spulenstrom. Rot und blau dargestellte Leitungen unterscheiden die Anschlüsse. Die digitalen Geräteanzeigen übernehmen die eingestellten Werte; der Aufbau ist schematisch und bildet keine konkreten Leybold-Geräte oder deren exakte Verdrahtung maßstabsgetreu nach.
