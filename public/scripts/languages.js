languagesData = {
    "english": 
    {
        "about" : {
            "title" : "About",
            "p1" : "Human Music is a project that starts with the dream of a better future. I experience joy through the listening of music that I have never heard before, and I experience joy living experiences that remind me about the random nature of our existence as humans. Since the internet is a environment governed by algorythms that seek the maximization of profits of the owners of the different platforms, I decided to create a platform that generates music recommendations through which I think is one of the ultimately random algorythms in the world: Human Nature.",
            "p2" : "This place is for sharing from the heart. Each one of us has the opportunity for sharing something that you think will be valuable for whoever listens. Something that becomes a space of light within the darkness. Something that can help anyone that listens overcome anger, sadness or pain. Something that can help anyone that listens to foster happiness, gratitude or confort. Something that can help anyone that listens to go deeply inside of (him/her)self, and through that process fight (his/her) demons and become a better actor for our society in this crazy experience that we are all sharing called life. Something that can help whoever listens feel that (he/she) is not alone, for all what is needed is contained within.",
            "p3" : "There is no limitations, there is no boundaries, there is nothing that is good, there is nothing that is bad. What will make this place special is that your recommendation comes from your heart. I believe music is a string that unites us all, and through the understanding of this basic fact we can reach to a conception that on the source we are all part of the same family. We are all human. We are all in this together, no matter from where we come from, no matter our color of skin, money in the bank, no matter if you are sad, no matter if you are angry. We are all in this together, and if we recongnize this basic fact we can move forward for building a better world.",
            "p4" : "Thank you for reading. Thank you for sharing. Thank you for being here. Thank you for being alive."
        }
    },
    "spanish":
    {
        "about" : {
            "title" : "Acerca De",
            "p1" : "Human Music es un proyecto que comienza con el sueño de un futuro mejor. Siento alegría al escuchar música que nunca antes había escuchado, y siento alegría al vivir experiencias que me recuerdan la naturaleza aleatoria de nuestra existencia como humanos. Dado que internet es un entorno regido por algoritmos que buscan la maximización de beneficios de los propietarios de las diferentes plataformas, decidí crear una plataforma que genere recomendaciones musicales a través del cual creo que es uno de los algoritmos más interesantes del mundo: La naturaleza humana.",
            "p2" : "Este lugar es para compartir desde el corazón. Cada uno de nosotros tiene la oportunidad de compartir algo que crea que será valioso para quien lo escuche. Algo que se convierta en un espacio de luz dentro de la oscuridad. Algo que puede ayudar a cualquier persona que escuche a superar la ira, la tristeza o el dolor. Algo que pueda ayudar a cualquiera que escuche a sentir felicidad, gratitud o confort. Algo que pueda ayudar a cualquier persona que escuche a profundizar en su interior, y a través de ese proceso luchar contra (sus) demonios y convertirse en un mejor actor para nuestra sociedad en esta loca experiencia que todos estamos compartiendo llamada vida. Algo que puede ayudar a quien escucha a sentir que (él / ella) no está solo, porque todo lo que se necesita está contenido en su interior.",
            "p3" : "No hay limitaciones, no hay fronteras, no hay nada que sea bueno, no hay nada que sea malo. Lo que hará que este lugar sea especial es que tu recomendación provenga de tu corazón. Creo que la música es una cuerda que nos une a todos, y mediante la comprensión de este hecho básico podemos llegar a una concepción de que en el fondo todos somos parte de la misma familia. Todos somos humanos. Estamos todos juntos en esto, no importa de dónde vengamos, no importa nuestro color de piel, dinero en el banco, no importa si estás triste, no importa si estás enojado. Todos estamos juntos en esto, y si reconocemos este hecho básico, podemos avanzar en la construcción de un mundo mejor.",
            "p4" : "Gracias por leer. Gracias por compartir. Gracias por estar aquí. Gracias por estar vivo."
        }
    }
}

const langEl  = document.querySelector(".langWrap");
const link    = document.querySelectorAll(".languageLink");
const titleEl = document.querySelector(".aboutTitle");
const p1      = document.getElementById("p1");
const p2      = document.getElementById("p2");
const p3      = document.getElementById("p3");
const p4      = document.getElementById("p4");

link.forEach(el => {
    el.addEventListener("click", ()=>{
    const attr = el.getAttribute("lang");

    titleEl.textContent = languagesData[attr].about.title;
    p1.textContent      = languagesData[attr].about.p1;
    p2.textContent      = languagesData[attr].about.p2;
    p3.textContent      = languagesData[attr].about.p3;
    p4.textContent      = languagesData[attr].about.p4;
    })
})