# Capitulo 1: Introduccion

## Dominio del Problema

### Definiciones:

* **Software**: Coleccion de programas, procedimientos, y la documentacion y datos asociados que determinan la operacion de un sistema de computacion.
* **Ingenieria del Software**: Aplicacion de un enfoque sistematico, disciplinado, y cuantificable al desarrollo, operacion, y mantenimiento del software.
  * **Enfoque Sistematico**: Metodologia y practica existentes para solucionar un problema dentro de un dominio determinado. Esto permite repetir el proceso y da la posibilidad de predecirlo (independientemente del grupo de personas que lo lleva a cabo).

### Software a nivel industrial

La diferencia con el software pensado por un alumno y el de nivel industrial radica en la calidad: Incluyendo usabilidad, confiabilidad, portabilidad, etc.
<br>El software a nivel industrial requiere una alta calidad, donde se requiere mucho testing en esta area. Se requiere la descomposicion en etapas del desarrollo de manera de poder encontrar "bugs" en cada una de ellas.

### El software es caro

En resumen el software es muy caro, por lo que es importante optimizar el proceso de desarrollo con el fin de abaratar el costo del software.

### Demorado y poco confiable

Las fallas del software son distintas de las fallas mecanicas o electricas:
* En software las fallas **NO** son consecuencias del uso y el deterioro.
* Las fallas ocurren como consecuencias de errores (o "bugs") introducidos durante el desarrollo.
* La falla que causa el problema existe desde el comienzo, solo que se manifiesta tarde.

### Mantenimiento

Una vez entregado, el software requiere de mantenimiento.

¿Porque es necesario el mantenimiento si el software no se deteriora con el uso? Para corregir errores residuales (*updates*). Existen dos tipos de mantenimientos:
* **Mantenimiento Correctivo**: Para mejorar funcionalmente el software (*upgrades*) y adaptarlos a los cambios de entorno.
* **Mantenimiento Adaptativo**: Incluye la comprension del software existente (codigo y documentacion), comprension de los efectos del cambio, realizacion de los cambios (codigo y documentacion), testear lo nuevo y re-testear lo viejo.

Durante la vida de un software, el mantenimiento puede costar mas que el desarrollo.

## Desafios de la Ingenieria del Software

El problema de producir software para satisfacer las necesidades del cliente/usuario guia el enfoque usado en Ingenieria del Software.
<br>Pero hay otros factores que tienen impacto en la eleccion del enfoque: **Escala**, **Calidad**, **Productividad**, **Consistencia**, **Cambios**.

### Escala

La Ingenieria del Software debe considerar la escala del sistema a desarrollar. Los metodos utilizados para desarrollar pequeños problemas no siempre escalan a grandes problemas.
<br>Los metodos de Ingenieria del Software deben tener la capacidad de adaptacion y respuesta de un sistema con respecto al rendimiento del mismo a medida que aumentan o disminuyen de forma significativa el numero de usuarios o requermientos del mismo.

### Productividad

La Ingenieria del Software esta motivada por el costo y el cronograma (*schedule*). Tanto una solucion que demora mucho tiempo como una que entrega un software barato y de baja calidad son inaceptables.
<br>El costo del software es principalmente el costo de la mano de obra, por lo que se mide en Persona/Mes (*PM*).
<br>El cronograma es muy importante en el contexto de negocios.
<br>La Productividad (en terminos de KLOG/PM) captura ambos conceptos, si es mas alta => menor costo y/o menor tiempo.

### Calidad

La otra motivacion detras de la Ingenieria del Software es la calidad.
<br>Desarrollar software de alta calidad es un objeto fundamenta.
* **Funcionalidad**: Capacidad de proveer funciones que cumplen las necesidades establecidas o implicadas.
* **Confiabilidad**: Capacidad de realizar las funciones requeridas bajo las condiciones establecidas durante un tiempo especifico.
* **Usabilidad**: Capacidad de ser comprendido, aprendido y usado.
* **Eficiencia**: Capacidad de proveer desempeño apropiado relativo a la cantidad de recursos usados.
* **Mantenibilidad**: Capacidad de ser modificado con el proposito de corregir, mejorar, o adaptar.
* **Portabilidad**: Capacidad de ser adaptado a distintos entornos sin aplicar otras acciones que las provistas a este proposito en el producto.

El concepto de calidad es especifico al proyecto: En algunos casos la confiabilidad es mas importante. En otros, la usabilidad. La **Confiabilidad** es usualmente el principal criterio de calidad.

La confiabilidad inversamente relacionada a la probabilidad de falla, si hay mas falla implica menos confiabilidad.

### Consistencia y Repetitividad

Desafio clave de la Ingenieria en Sistemas: Como asegurar que el exito pueda repetirse, con el fin de mantener alguna consistencia en la calidad y la productividad.
<br>Un objetivo de la Ingenieria del Software es la **Sucesiva** produccion de sistemas de alta calidad y con alta productividad.
<br>La consistencia permite predecir el resultado del proyecto con certeza razonable. Sin consistencia seria dificil estimar costos.

### Cambio

Los cambios en las empresas/instituciones es lo habitual. El software debe cambiar para adaptarse a los cambios de dicha institucion.
<br>Las practicas de Ingenieria del Software deben preparar al software para que este sea facilmente modificable. Los metodos que no permiten cambios, aun si producen alta calidad y productividad, son pocos utiles.

## Enfoque de la Ingenieria del Software

Consistentemente desarrollamos software de alta calidad y con alta productividdad (*C&P*) para problemas de gran escala que se adapten a los cambios.
* *C&P* son los objetivos basicos a perseguir bajo gran escala y tolerencia a cambios.
* *C&P* son consecuencia de la gente, los proceso y la tegnologia.

La Ingenieria del Software se enfoca mayormente en el proceso para conseguir los objetivos de calidad y productividad.
<br>El **Enfoque Sistemativo** es realmente el proceso que se utiliza.
<br>La Ingenieria del Software separa el proceso para desarrollar software del producto desarrollado (es decir el software). Es aqui donde se distingue de las otras disciplinas informaticas.
<br>Diseñar el proceso apropiado y su control es el desafio clave de la Ingenieria del Software.

### El Proceso de Desarrollo en Fases

El proceso de desarrollo consiste de varias fases, cada fase termina con una salida definida. Las fases se realizan en el orden especificado por le modelo de proceso que se elija seguir.
<br>El motivo de separar en fases es la **Separacion de Incumbencias**: Cada fase manipula distintos aspectos del desarrollo de software.
<br>El proceso en fases permite **Verificar la Calidad y Progreso** en momentos definidos del desarrollo, al final de la fase.

Modelos de procesos para el desarrollo de software:
* **Analisis y especificacion de requerimientos**.
* **Arquitectura**.
* **Diseño**.
* **Codificacion**.
* **Testing**.
* **Entrega e instalacion**.

### Administracion del Proceso

La administracion del proceso establece como asignar los recursos a las distintas tareas, como organizarlas temporalmente, como asegurar que cada fase se desarrollo apropiadamente, etc.
<br>Estas cuestiones se manejan a traves de la administracion del proceso. Sin la administracion del proceso es virtualmente imposible cumplir con los objetivos de *C&P*.