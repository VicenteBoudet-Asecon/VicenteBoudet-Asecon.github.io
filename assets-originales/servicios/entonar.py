"""Da a cada ilustración de servicio su propio clima de color y de luz.

Por qué existe: las 8 ilustraciones generadas comparten madera ámbar, luz
dorada de ventanal y el mismo acabado liso (seis de ocho con tono medio de
27°–35°), y juntas se leen como "la misma foto". Este script parte SIEMPRE de
los originales de esta carpeta y escribe las versiones entonadas en
public/services/ (mismos nombres, así que no cambia ninguna referencia).

Cada área recibe: un tinte distinto en sombras y en luces (split toning),
ajustes de saturación/contraste/brillo, una viñeta de intensidad propia y un
grano fino que rompe el acabado liso y brillante de las imágenes generadas.

Uso (desde cualquier carpeta):
    python assets-originales/servicios/entonar.py
Para deshacerlo: copiar los .jpg de esta carpeta sobre public/services/.
Después hay que regenerar las miniaturas del banner de Clientes (ver
make_thumbs / public/services/banner/) si se quiere que sigan a las nuevas.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance

AQUI = Path(__file__).resolve().parent
DESTINO = AQUI.parents[1] / "public" / "services"

# Colores en 0..1 (RGB). `t` = cuánto se acercan sombras y luces a su tinte;
# `matte` levanta los negros (acabado menos "digital"); `vig` = viñeta.
LOOKS = {
    # 01 · papel cálido y mate: sigue siendo cálida pero sin la madera chillona
    "contabilidad": dict(sat=0.80, con=1.00, bri=1.02, sombra=(0.30, 0.25, 0.22), luz=(1.00, 0.95, 0.86), t=0.30, matte=0.045, vig=0.18, grano=0.016),
    # 02 · azul pizarra: documentos y números, luz fría de oficina
    "tributaria": dict(sat=0.70, con=1.04, bri=1.00, sombra=(0.10, 0.19, 0.36), luz=(0.86, 0.93, 1.00), t=0.55, matte=0.020, vig=0.22, grano=0.020, hue=-4),
    # 03 · verde azulado: revisión, rigor, más contraste
    "auditoria": dict(sat=0.88, con=1.10, bri=0.98, sombra=(0.03, 0.24, 0.27), luz=(0.96, 1.00, 0.97), t=0.50, matte=0.015, vig=0.26, grano=0.020),
    # 04 · luminoso y fresco: equipo, conversación, luz de día
    "remuneraciones": dict(sat=0.95, con=0.95, bri=1.07, sombra=(0.16, 0.30, 0.36), luz=(1.00, 0.97, 0.92), t=0.32, matte=0.030, vig=0.12, grano=0.016),
    # 05 · burdeos y ciruela: cuero, mazo, ambiente sobrio (la marca es morada)
    "legal": dict(sat=0.92, con=1.12, bri=0.90, sombra=(0.30, 0.07, 0.22), luz=(1.00, 0.88, 0.76), t=0.52, matte=0.012, vig=0.36, grano=0.020, hue=-6),
    # 06 · medianoche: pantallas y números, azul profundo con luces cian
    "finanzas-corporativas": dict(sat=1.15, con=1.12, bri=0.96, sombra=(0.02, 0.07, 0.24), luz=(0.80, 0.95, 1.00), t=0.55, matte=0.010, vig=0.30, grano=0.022),
    # 07 · piedra: gris cálido y sobrio para la mesa de estructuras
    "reestructuraciones-patrimoniales": dict(sat=0.50, con=1.06, bri=1.00, sombra=(0.22, 0.20, 0.21), luz=(0.98, 0.95, 0.90), t=0.35, matte=0.035, vig=0.20, grano=0.018),
    # 08 · atardecer rosado: el cielo naranja pasa a rosa y las sombras a azul
    "representacion-empresas-extranjeras": dict(sat=0.95, con=1.04, bri=1.00, sombra=(0.08, 0.15, 0.31), luz=(1.00, 0.80, 0.84), t=0.50, matte=0.020, vig=0.24, grano=0.019, hue=-14),
}


def entonar(im: Image.Image, p: dict, semilla: int) -> Image.Image:
    # 1) Ajustes globales con PIL (más fieles que hacerlos a mano).
    im = im.convert("RGB")
    if p.get("hue"):
        h, s, v = im.convert("HSV").split()
        h = h.point(lambda x, d=p["hue"]: (x + int(d * 255 / 360)) % 256)
        im = Image.merge("HSV", (h, s, v)).convert("RGB")
    im = ImageEnhance.Color(im).enhance(p["sat"])
    im = ImageEnhance.Contrast(im).enhance(p["con"])
    im = ImageEnhance.Brightness(im).enhance(p["bri"])

    a = np.asarray(im, dtype=np.float32) / 255.0
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]

    # 2) Split toning: las sombras se acercan a un color y las luces a otro; los
    #    medios tonos (piel, madera) casi no se tocan, para no teñir de más.
    ws = np.clip(1.0 - 2.0 * lum, 0, 1) ** 1.5
    wh = np.clip(2.0 * lum - 1.0, 0, 1) ** 1.5
    sombra = np.array(p["sombra"], dtype=np.float32)
    luz = np.array(p["luz"], dtype=np.float32)
    a = a + p["t"] * (ws * (sombra - a) + wh * (luz - a))

    # 3) Negros levantados (acabado mate) y viñeta propia.
    a = a * (1 - p["matte"]) + p["matte"] * 0.5 * (1 + 0.0 * a)
    alto, ancho = a.shape[:2]
    yy, xx = np.mgrid[0:alto, 0:ancho].astype(np.float32)
    r2 = ((xx / ancho - 0.5) ** 2 + (yy / alto - 0.5) ** 2) / 0.5
    a = a * (1 - p["vig"] * np.clip(r2, 0, 1) ** 1.2)[..., None]

    # 4) Grano fino, más presente en los medios tonos que en negros y blancos.
    rng = np.random.default_rng(semilla)
    ruido = rng.normal(0.0, p["grano"], (alto, ancho, 1)).astype(np.float32)
    ruido = ruido + rng.normal(0.0, p["grano"] * 0.35, (alto, ancho, 3)).astype(np.float32)  # un poco de grano de color
    a = a + ruido * (0.55 + 0.45 * (1 - np.abs(lum - 0.5) * 2))

    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


if __name__ == "__main__":
    for i, (nombre, p) in enumerate(LOOKS.items()):
        origen = AQUI / f"{nombre}.jpg"
        salida = DESTINO / f"{nombre}.jpg"
        out = entonar(Image.open(origen), p, semilla=100 + i)
        out.save(salida, "JPEG", quality=84, optimize=True, progressive=True)
        print(f"{nombre:40s} {origen.stat().st_size / 1024:5.0f} KB -> {salida.stat().st_size / 1024:5.0f} KB")
