projeto=ocorrencias
local_frontend=/opt/clientes/99-matheus-mapa-desastres
server_frontend=/var/www/ocorrencias.davidmarques.com.br
ssh_alias=diamond

#
# Execução da build do frontend
#

if [ -f "./$projeto.tar" ]; then
    rm "./$projeto.tar"
    echo "Arquivo removido com sucesso."
fi

tar acf ./$projeto.tar index.html index.js 

scp $local_frontend/$projeto.tar $ssh_alias:/tmp

rm "$local_frontend/$projeto.tar"

echo ""
echo "Servidor - [2/2] Executando comandos no servidor"
echo ""

server_cmd=""

server_cmd=$server_cmd" cd $server_frontend;"
server_cmd=$server_cmd" rm -rf ./*;"
server_cmd=$server_cmd" mv /tmp/$projeto.tar .;"
server_cmd=$server_cmd" tar -xf ./$projeto.tar;"
server_cmd=$server_cmd" rm ./$projeto.tar;"

ssh $ssh_alias "$server_cmd"
