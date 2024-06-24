# Deploy da aplicação frontend

Procedimento para realizar a base do deploy da aplicação

- [Build da aplicação](#criar-pasta-para-build-da-aplicação)
- [Nginx](#configurar-nginx)
- [Certificado](#certificado)

## Criar pasta para build da aplicação

1- Criar pasta para a build:

```yml
$ sudo mkdir -p /var/www/ocorrencias.davidmarques.com.br
$ sudo chown -R $USER:$USER /var/www/ocorrencias.davidmarques.com.br
```

## Configurar Nginx

1- Criar arquivo de configuração Nginx:

```yml
$ sudo vim /etc/nginx/sites-available/ocorrencias.davidmarques.com.br
```

Inserir o seguinte conteúdo:

```yml
server {
  listen 80;
  listen [::]:80;

  server_name ocorrencias.davidmarques.com.br;

  root /var/www/ocorrencias.davidmarques.com.br;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html =404;
  }
}
```

2- Criar link simbólico do arquivo de configuração:

```yml
$ sudo ln -s /etc/nginx/sites-available/ocorrencias.davidmarques.com.br /etc/nginx/sites-enabled/
```

3- Testar e Reiniciar Nginx

```yml
$ sudo nginx -t
$ sudo service nginx stop
$ sudo service nginx start
```

## Certificado

1. Criar certificado

```yml
$ sudo certbot --nginx -d ocorrencias.davidmarques.com.br
```

2. Testar se os certificados estão com a classificação "A"

https://ssllabs.com/ssltest/analyze.html?d=ocorrencias.davidmarques.com.br
