export const todosLosSecretos = [
    {
        id: 1,
        tipo: 'Secret',
        nombre: 'Secreto dado vuelta',
        imagen: '/secretos/01-secret_atras.png',
    },
    {
        id: 2,
        tipo: 'Secret',
        nombre: 'Es solo un Pescado',
        imagen: '/secretos/02-secret_pescado.png',
    },
    {
        id: 3,
        tipo: 'Secret',
        nombre: 'No sabe usar Git',
        imagen: '/secretos/03-secret_git.png',
    },
    {
        id: 4,
        tipo: 'Secret',
        nombre: 'Tiene depresion',
        imagen: '/secretos/04-secret_depresion.png',
    },
    {
        id: 5,
        tipo: 'Secret',
        nombre: 'Le tiene miedo a la mujer',
        imagen: '/secretos/05-secret_miedoMujer.png',
    },
    {
        id: 6,
        tipo: 'Secret',
        nombre: 'Le tiene miedo a las mujeres',
        imagen: '/secretos/06-secret_miedoMujeres.png',
    },
    {
        id: 7,
        tipo: 'Secret',
        nombre: 'Es fumador',
        imagen: '/secretos/07-secret_fumador.png',
    },
    {
        id: 8,
        tipo: 'Secret',
        nombre: 'Juega al LOL',
        imagen: '/secretos/08-secret_LOL.png',
    },
    {
        id: 9,
        tipo: 'Secret',
        nombre: 'Es de Salsipuedes',
        imagen: '/secretos/09-secret_Salsi.png',
    },
    {
        id: 10,
        tipo: 'Secret',
        nombre: 'Le falta un Riñon',
        imagen: '/secretos/10-secret_riñon.png',
    },
    {
        id: 11,
        tipo: 'Secret',
        nombre: 'Es de Neuquen',
        imagen: '/secretos/11-secret_Neuquen.png',
    },
    {
        id: 12,
        tipo: 'Secret',
        nombre: 'Es de la Calera',
        imagen: '/secretos/12-secret_Calera.png',
    },
    {
        id: 13,
        tipo: 'Secret',
        nombre: 'Es de España',
        imagen: '/secretos/13-secret_España.png',
    },
    {
        id: 14,
        tipo: 'Secret',
        nombre: 'Es de Villa Allende',
        imagen: '/secretos/14-secret_VillaAllende.png',
    },
    {
        id: 15,
        tipo: 'Secret',
        nombre: 'Es Migajero',
        imagen: '/secretos/15-secret_migajas.png',
    },
    {
        id: 16,
        tipo: 'Secret',
        nombre: 'Es Ludopata',
        imagen: '/secretos/16-secret_ludopata.png',
    },
    {
        id: 17,
        tipo: 'Secret',
    nombre: 'Le gusta las flequilludas',
    imagen: '/secretos/17-secret_flequillo.png',
    },
    {
        id: 18,
        tipo: 'Secret',
        nombre: 'Murderer',
        imagen: '/secretos/18-secret_murderer.png',
    },
    {
        id: 19,
        tipo: 'Secret',
        nombre: 'Complice',
        imagen: '/secretos/19-secret_accomplice.png',
    },
]

export const encontrarSecretoPorId = (id) => {
    // Busca y devuelve el secreto con el ID dado
    return todosLosSecretos.find(secreto => secreto.id === id);
}