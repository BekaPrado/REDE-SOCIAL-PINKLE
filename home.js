const API_BASE_URL = "https://back-spider.vercel.app/publicacoes";
const API_USERS_URL = "https://back-spider.vercel.app/user/listarUsers";

document.addEventListener("DOMContentLoaded", async () => {
    //aqui recupera os dados do usario que esta logado
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (usuarioLogado) {
  
        const avatar = document.getElementById("userAvatar");
        if (avatar) {
            avatar.src = usuarioLogado.imagemPerfil;
        }
    }

    //carrega os posts
    carregarPublicacoes();
});

// publicações
async function carregarPublicacoes() {
    try {
        const [resPublicacoes, resUsuarios] = await Promise.all([
            fetch(`${API_BASE_URL}/listarPublicacoes`),
            fetch(API_USERS_URL)
        ]);

        if (!resPublicacoes.ok || !resUsuarios.ok) {
            throw new Error("Erro ao buscar dados da API");
        }

        const publicacoes = await resPublicacoes.json();
        const usuarios = await resUsuarios.json();

        const main = document.querySelector("main");
        const template = document.querySelector("#postTemplate");

        // "carrega o "novo" post "
        main.querySelectorAll(".post-container:not(#postTemplate)").forEach(e => e.remove());

        publicacoes.forEach(publicacao => {
            const usuario = usuarios.find(u => u.id == publicacao.idUsuario) || {};

            const post = template.cloneNode(true);
            post.style.display = "block";
            post.id = "";

            post.querySelector(".post-profile").src = usuario.imagemPerfil || "./img/default-avatar.jpg";
            post.querySelector(".post-username").textContent = usuario.nome || "Usuário";
            post.querySelector(".date").textContent = publicacao.dataPublicacao;
            post.querySelector(".post-image").src = publicacao.imagem;
            post.querySelector(".post-author").innerHTML = `<strong>${usuario.nome || "Usuário"}</strong>`;
            post.querySelector(".post-description").textContent = publicacao.descricao;

            //comenta
            const comentariosContainer = post.querySelector(".comments");
            comentariosContainer.innerHTML = (publicacao.comentarios || []).map(comentario => {
                const autor = usuarios.find(u => u.id == comentario.idUsuario);
                return `<p><strong>${autor?.nome || "Anônimo"}</strong>: ${comentario.descricao}</p>`;
            }).join("") || "<p>Sem comentários ainda.</p>";

            //curtidaa
            const likeBtn = post.querySelector(".like");
            likeBtn.textContent = `❤️ ${publicacao.curtidas?.length || 0}`;
            likeBtn.onclick = () => {
                const nomes = (publicacao.curtidas || []).map(c => {
                    const u = usuarios.find(u => u.id == c.idUsuario);
                    return u?.nome || "Desconhecido";
                });
                alert(nomes.length > 0 ? `Curtido por:\n${nomes.join("\n")}` : "Ninguém curtiu ainda.");
            };

            //comentar
            post.querySelector(".comment-btn").onclick = () => {
                const input = post.querySelector(".comment-input");
                alert(`Comentário em ${publicacao.id}: ${input.value}`);
                input.value = "";
            };

            //excluir
            post.querySelector(".delete-btn").onclick = () => {
                alert(`Excluir publicação ${publicacao.id} (simulação)`);
            };

            main.appendChild(post);
        });

    } catch (erro) {
        console.error("Erro ao carregar publicações:", erro);
    }
}
