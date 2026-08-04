# CriptoSuite

CriptoSuite es una plataforma web interactiva para estudiar y simular cifrados clásicos de forma visual. El proyecto está pensado como una herramienta académica y didáctica para comprender cómo funcionan distintos métodos de cifrado y transposición, sin necesidad de usar un servidor.

## ¿Qué es este proyecto?

Este proyecto reúne 15 algoritmos históricos de criptografía clásica en una interfaz sencilla, donde cada cifrado puede explorarse con ejemplos, parámetros configurables y una simulación paso a paso. Está implementado como una web estática, por lo que se puede abrir directamente en un navegador.

## Características principales

- Simulación interactiva de 15 cifrados clásicos.
- Interfaz sencilla y organizada por categorías.
- Ejemplos de entrada y salida para cada método.
- Enfoque didáctico para aprender la lógica de cada algoritmo.
- Funciona completamente del lado del cliente.

## Estructura del proyecto

- index.html: página principal con la lista de cifrados disponibles.
- *.html: páginas individuales para cada algoritmo.
- css/: estilos globales del sitio.
- js/: lógica de la interfaz y de los algoritmos.
- js/ciphers/: implementación de los cifrados.
- js/pages/: controladores de cada página.

## Cómo usarlo

1. Abre la carpeta del proyecto en tu navegador.
2. Ejecuta el archivo index.html.
3. Elige un cifrado desde la lista principal.
4. Introduce un texto, ajusta los parámetros si es necesario y observa el resultado.

## Cifrados incluidos

### 1. Cifrado César
Es uno de los cifrados más antiguos y simples. Consiste en desplazar cada letra del alfabeto un número fijo de posiciones. Por ejemplo, si el desplazamiento es 3, la letra A pasa a ser D.

### 2. ROT-5
Es una variante numérica del cifrado César. En lugar de trabajar con letras, gira los dígitos del 0 al 9 desplazándolos cinco posiciones.

### 3. ROT-13
Es una rotación fija de 13 posiciones sobre el alfabeto. Es un cifrado muy conocido por su simplicidad y por el hecho de que al aplicarlo dos veces devuelve el texto original.

### 4. ROT-47
Aplica una rotación de 47 posiciones sobre el rango ASCII imprimible. Permite cifrar letras, números y símbolos de puntuación, no solo texto alfabético.

### 5. Cifrado Atbash
Es un cifrado de sustitución simple que invierte el alfabeto. Cada letra se reemplaza por su opuesta en el espejo del alfabeto: A por Z, B por Y, y así sucesivamente.

### 6. Cuadrado de Polybios
Este cifrado reemplaza cada letra por un par de coordenadas obtenidas de una cuadrícula 5x5. En lugar de sustituir una letra por otra, la transforma en un código basado en posición.

### 7. La Escítala
Un cifrado de transposición usado por los espartanos. El mensaje se escribe en un cilindro y se lee siguiendo un patrón determinado, de modo que el texto se reorganiza sin cambiar las letras.

### 8. Cifrado por Columnas
Consiste en escribir el mensaje en filas y leerlo por columnas. La disposición cambia el orden de los caracteres, lo que produce un texto cifrado.

### 9. Cifrado por Filas
El texto se organiza en filas y se lee de forma distinta a como fue escrito. Esto produce una transposición del mensaje original.

### 10. Cifrado por Grupos
El mensaje se divide en bloques de tamaño fijo y dentro de cada bloque se permutan las posiciones según un orden predefinido.

### 11. Cifrado por Series
El texto se distribuye mediante una sucesión numérica periódica, de modo que las letras se reordenan de forma estructurada en submensajes.

### 12. Cifrado Vigenère
Es un cifrado polialfabético que usa una clave para seleccionar distintos desplazamientos a lo largo del mensaje. Esto lo hace mucho más resistente que un cifrado monoalfabético simple.

### 13. Disco de Alberti
Es un dispositivo histórico que combina dos alfabetos y permite rotar el disco interno para cambiar el desplazamiento durante el cifrado. Representa un paso importante hacia los cifrados polialfabéticos.

### 14. Cifrado Playfair
Opera sobre pares de letras (dígrafos) en una cuadrícula 5x5. En lugar de sustituir letras de forma individual, trabaja con combinaciones de dos caracteres.

### 15. Cifrado de Hill
Es un cifrado matemático basado en matrices. Cada bloque de texto se transforma mediante operaciones algebraicas en módulo de un número, lo que lo convierte en un enfoque mucho más avanzado.

## Tecnologías utilizadas

- HTML5
- CSS
- JavaScript
- Tailwind CSS

## Objetivo pedagógico

El propósito de CriptoSuite es mostrar de forma clara y visual cómo funcionan los métodos de cifrado clásicos, ayudando a entender la diferencia entre sustitución y transposición, así como la evolución desde los métodos más simples hacia los más complejos.

## Créditos

Proyecto desarrollado como una herramienta educativa de criptografía clásica.
