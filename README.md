## Process RUN store variable

To pass a variable from the child process at the main thread only need to send a line UTF-8 with the start `###=>`.

**Sample**

```js
console.log(`###=> me=Hello everybody`)
```

This script returns the next variables:

```json
{
    "me": "Hello everybody"
}
```

## Process RUN store environment variable

This solution permit passing variables through the environment variables. need print a line UTF-8 with the start `###env=>`

**Sample**

```js
console.log(`###env=> FOO=VAZ`)
```

next script:

```sh
$ env
...
FOO=VAZ
...
```


