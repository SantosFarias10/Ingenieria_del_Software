# Capitulo 3: Analisis y Especificacion de los Requisitos del Software

El problema de escala es fundamental en Ingenieria del Software.
<br>**Identificar y Especificar** los requisitos necesariamente involucra interaccion con la gente, NO se puede automatizar.
<br>La fase de requisitos finaliza produciendo el documento con la especificacion de los requerimientos del software (**SRS**). La SRS especifica lo que el sistema propuesto debe hacer.

## Definiciones:

* **Requerimientos**: 
  * Una condicion o capacidad necesaria de un usuario para solucionar un problema o alcanzar los objetos.
  * Una condicion o capacidad necesaria que debe poseer o cumplir un sistema [...].

## Requerimientos del Software

### ¿Por que la SRS es necesaria?

La SRS establece las bases para el **Acuerdo** entre el cliente/usuario y quien suministrara el software.
<br>Hay 3 partes involucradas:
* Necesidades del cliente.
* Consideraciones del usuario.
* Comunicacion del desarrollor.

**Brecha Comunicacional** entre las partes:
* Cliente: No comprende el proceso de desarrollo de software.
* Desarrollador: No conoce el problema del cliente ni su area de aplicacion.

La SRS es el medio para reconciliar las diferencias y especificar las necesidades del cliente/usuario de manera que todos entiendan.
* **Ayuda** al usuaria a comprender sus necesidades.
* Los usuarios no siempre saben lo que quieren o necesitan.
  * Debe analizar y comprender el potencial.
* El proceso de requerimientos ayuda a aclarar las necesidades.
* La SRS provee una referencia para la **Validacion** del producto final.
* Deberia dar una clara comprension de lo que se espera.

Una SRS de alta calidad es esencial para obtener un software de calidad. Los errores de requerimientos solo se manifiestan en el software final.
<br>Una buena SRS reduce los costos de desarrollo. Los errores de la SRS son mas caros de corregir a medida que el proyecto progresa.

### Proceso de Requerimientos

Actividades basicas:
1. **Analisis del problema o requerimientos**.
   * Objetivo: Comprender la estructura del problema y su dominio (componentes, entradas, salida).
   * Exige la recoleccion/extraccion.
   * Se enfoca en la comprension del sistema deseado y sus requerimientos.
   * Durante el analisis se usan tecnicas como el diagrama de flujo de datos, diagramas de objetos, etc.
2. **Especificacion de los requerimientos**.
   * Puede ayudar al analisis.
   * Se enfoca en el comportamiento externo.
3. **Validacion**.
   * Puede mostrar brechas que conduciran a mas analisis y mas especificaciones

El proceso NO es lineal; es iterativo y en paralelo.
<br>Existe superposicion entre las fases: Algunas partes pueden estar siendo especificadas mientras otras estan aun bajo analisis.

## Analisis del Problema

Como digimos el objetivo del analisis es lograr una buena comprension de las necesidades, requerimientos, y restricciones del software.
<br>El analisis incluye:
* Entrevistas con el cliente y usuarios.
* Lectura de manuales.
* Estudio del sistema actual.
* Ayudar el cliente/usuario a comprender nuevas posibilidades.

Algunas cuestiones:
* El analisis debe obtener la informacion necesaria.
* *Brainstroming*: Interactuar con el cliente para establecer las propiedades deseadas.
* La habilidad en la comunicacion es muy importantes.
* Organizar la informacion ya que se recolecta una gran cantidad.
* Asegura completitud.
* Asegura consistencia.
* Evita diseño interno.

Extrategia basica: **Dividir y Conquistar**.
<br>Descompone el problema en pequeñas partes; comprende cada una de ellas y las relaciones entre las mismas, pero ¿Con respecto a que?
* Funciones: Analisis Estructural.
* Objetos: Analisis Orientado a Objetos.
* Eventos del sistema: Particionado de eventos.

### Enfoque Informal

No existe una metodologia, la informacion se obtiene mediante el analisis, observaciones, interacciones, discusiones, etc.
<br>No se construye un modelo formal del sistema.
<br>La informacion recogida se plasma y organiza directamente en la SRS, la cual es el objeto de revision con el cliente.

### Modelado de Flujo de Datos

Se enfoca en las funciones realizadas en el sistema, no en los requisitos no-funcionales.
<br>Ve el sistema como una red de transformadores de datos la cual fluye la informacion.
<br>Para el modelado se usa el Diagrama de Flujo de Datos (**DFD**) para organizar la informacion y guiar al analis, y tambien usa la descomposicion funcional.

### DFD

Un DFD es una representacion grafica de algoritmos/procesos, donde se representa el flujo de datos del sistema.
* Ve el sistema como una transformacion de entrada en salidas.
* La transformacion se realiza a traves de "transformadores/procesos".
* El DFD captura la manera en que ocurre la transformacion de la entrada en la salida a medida que los datos se mueven a traves de los transformadores.
* No se limita al software.

Los transformadores se representan con circulos/burbujas con un nombre (verbo), estas burbujas se conectan con flechas sobre las cuales se identifican los datos que fluyen. Con rectangulos se representan una fuente o un sumidero y es generador/consumidor de datos (usualmente se encuentran fuera del sistema). Los archivos externos se muestran como una palabra subrayada (almacen de datos). La necesidad de multiples flujos de datos se representan con * ("*and*"), similarmente existe una relacion de "*or*" que se representa con un +.

El DFD se enfoca en que hacen los transformadores, no como lo hacen. En general, NO hay loops (razonamiento condicional).

### Modelado Orientado a Objetos

Ventajas:
* Es mas facil de construir y de mantener.
* La transicion del analisis orientado a objetos al diseño orientado a objetos parece ser mas simple.
* Es mas resistente/adaptable a cambios porque los objetos son mas estables que las funciones.

El sistema es visto como un conjunto de objetos interactuando entre si, o con el usuario, a traves de servicios que cada objeto provee.
<br>Objetivos:
* Identificar los objetos, o sea las clases, en el dominio del problema.
* Definir las clases identificando cual es la informacion del estado que ésta encapsula (los atribuoto).

El sistema consta de objetos (xd):
* Cada objeto tiene atributos que juntos definen al objeto. Definen el estado del objeto.
* Los objetos de tipos similares se agrupan en clases, de objetos.
* Un objeto provee servicios o realiza operaciones.
* Estos servicios son los unicos medios que permiten ver o modificar el estado de un objeto.
* Los servicios se acceden a traves de mensajes que se envian a los objetos.

### Diagrama de Clases

Representa graficamente la estructura del problema.
<br>Las clases se conforman por su nombre, atributos y servicios.
<br>Tiene una estructura de generalizacion-especializacion, que es utilizado para representar herencia de objetos.
<br>Existe la multiplicidad de relaciones (de 1 a N, de N a N) y se representa con un circulo negro.
<br>La Asociacion: Representa una relacion entre objetos de distintas clases.

### Modelado Orientado a Objetos: Analisis

Los pasos mas significativos para realizar el analsis orientado a objetos son:
* Identificar objetos y clases.
* Identificar estructuras.
* Identificar atributos.
* Identificar asociaciones.
* Definir servicios.