# Organizador de descargas

Herramienta personal en Node.js para ordenar archivos de `Downloads` por tipo.

Por seguridad, el modo por defecto solo simula lo que haria.

## Comandos

### Windows facil

Para tenerlo en el Escritorio, ejecuta una vez:

```txt
crear-acceso-escritorio.cmd
```

Eso crea un acceso directo llamado `Organizador de descargas` en el Escritorio.

Tambien puedes abrir el menu directamente con:

```txt
organizador.cmd
```

Se abre un menu para simular, organizar, ver lotes y deshacer. Las opciones que mueven archivos primero muestran una simulacion y piden escribir `SI` para confirmar.

Si lo ejecutas desde PowerShell y `npm` esta bloqueado por la politica de scripts, usa `npm.cmd`.

### Terminal

```bash
npm.cmd run dry-run
npm.cmd run apply
npm.cmd run json
npm.cmd run undo:dry-run
npm.cmd run undo
npm.cmd run undo:list
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

## Mayusculas y minusculas

El organizador no distingue mayusculas de minusculas para decidir donde mover un archivo.

Ejemplos:

```txt
factura.PDF -> PDF
foto.JPG -> Imagenes
ana.garcia.4ºa.PDF -> Profesor/4ºA/garcia.ana
luis.ruiz.2eso.PDF -> aviso, se queda en Downloads
```

El nombre original del archivo se conserva al moverlo.

## Modo Profesor

El organizador detecta documentos con nombre tipo:

```txt
nombre.apellido.curso.pdf
nombre.apellido.curso.docx
nombre.apellido.curso.zip
nombre.apellido.clase.pdf
```

Ejemplos:

```txt
ana.garcia.2ºa.pdf
juan.perez.1bach.docx
maria.lopez.dam1.zip
laura.martin.4ºa.pdf
```

Y los guarda asi:

```txt
Organizado/Profesor/2ºA/garcia.ana/ana.garcia.2ºa.pdf
Organizado/Profesor/1BACH/perez.juan/juan.perez.1bach.docx
Organizado/Profesor/DAM1/lopez.maria/maria.lopez.dam1.zip
Organizado/Profesor/4ºA/martin.laura/laura.martin.4ºa.pdf
```

Si un documento de ESO no indica letra de grupo, se queda en `Downloads` y el programa muestra un aviso:

```txt
ana.garcia.4º.pdf -> aviso, se queda en Downloads
luis.ruiz.2eso.pdf -> aviso, se queda en Downloads
```

Puedes cambiar cursos, clases y extensiones en `professorMode` dentro de `config.json`.

Las clases se configuran en la lista `classes`:

```json
"classes": [
  "1ºA",
  "1ºB",
  "2ºA",
  "2ºB",
  "3ºA",
  "3ºB",
  "4ºA",
  "4ºB"
]
```

Puedes anadir mas, por ejemplo `4ºC`. El programa reconoce tambien formas como `4a`, `4A` o `4ºa`.

Los cursos que necesitan letra se configuran en `classLetterRequiredCourses`:

```json
"classLetterRequiredCourses": [
  "1ESO",
  "2ESO",
  "3ESO",
  "4ESO"
]
```

## Ejemplo

```txt
PDF: factura.pdf -> C:\Users\liopr\Downloads\Organizado\PDF\factura.pdf
Imagenes: foto.jpg -> C:\Users\liopr\Downloads\Organizado\Imagenes\foto.jpg
```

El log queda en `logs/organizador.log`.

## Deshacer

Cada organizacion real guarda un lote en `logs/movimientos`.

Ver lotes:

```bash
npm.cmd run undo:list
```

Simular deshacer el ultimo lote:

```bash
npm.cmd run undo:dry-run
```

Deshacer el ultimo lote:

```bash
npm.cmd run undo
```
