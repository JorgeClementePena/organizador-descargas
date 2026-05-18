# Organizador de descargas

Herramienta personal en Node.js para ordenar archivos de `Downloads` por tipo.

Por seguridad, el modo por defecto solo simula lo que haria.

## Comandos

```bash
npm run dry-run
npm run apply
npm run json
npm run undo:dry-run
npm run undo
npm run undo:list
```

`dry-run` muestra movimientos sin tocar archivos.

`apply` mueve archivos de verdad.

`json` genera la simulacion como JSON.

## Configuracion

Edita `config.json` para cambiar origen, destino y reglas:

```json
{
  "sourceDir": "%USERPROFILE%\\Downloads",
  "targetBaseDir": "%USERPROFILE%\\Downloads\\Organizado",
  "minAgeMinutes": 5
}
```

`minAgeMinutes` evita mover archivos demasiado recientes, util para no tocar descargas en curso.

## Modo Profesor

El organizador detecta documentos con nombre tipo:

```txt
nombre.apellido.curso.pdf
nombre.apellido.curso.docx
nombre.apellido.curso.zip
```

Ejemplos:

```txt
ana.garcia.2eso.pdf
juan.perez.1bach.docx
maria.lopez.dam1.zip
```

Y los guarda asi:

```txt
Organizado/Profesor/2ESO/garcia.ana/ana.garcia.2eso.pdf
Organizado/Profesor/1BACH/perez.juan/juan.perez.1bach.docx
Organizado/Profesor/DAM1/lopez.maria/maria.lopez.dam1.zip
```

Puedes cambiar cursos y extensiones en `professorMode` dentro de `config.json`.

## Ejemplo

```txt
PDF: factura.pdf -> C:\Users\liopr\Downloads\Organizado\PDF\factura.pdf
Imagenes: foto.jpg -> C:\Users\liopr\Downloads\Organizado\Imagenes\foto.jpg
```

El log queda en `logs/organizador.log`.

## Deshacer

Cada `npm run apply` guarda un lote en `logs/movimientos`.

Ver lotes:

```bash
npm run undo:list
```

Simular deshacer el ultimo lote:

```bash
npm run undo:dry-run
```

Deshacer el ultimo lote:

```bash
npm run undo
```
