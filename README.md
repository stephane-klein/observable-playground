# Conversations Archive

```sh
$ mise install
$ pnpm install
$ ./scripts/generate-all-conversations.json.js
$ pnpm run dev
```


```sh
$ pnpm run build
$ pnpm run preview
```

## Build and test Docker image

First I build the image:

```sh
$ docker compose build
```

Then I start this docker image:

```sh
$ docker compose up -d
```

And I check on <http://localhost> if it works properly.

If everything is good, I push this image:

```sh
$ docker compose push
```

The deployment is performed on the side of https://github.com/stephane-klein/sklein.xyz/tree/main/deployment
