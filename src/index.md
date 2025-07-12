# Mes conversations IA

Cette page contient quelques statistiques de mon utilisation d'agents conversationnels.

Depuis juin 2025, j'ai migré vers [Open WebUI](https://openwebui.com/) couplé avec [OpenRouter](https://openrouter.ai/) et [LMArena](https://lmarena.ai/) que je n'ai pas encore inclus dans ce tableau. Je pense les intégrer prochainement.

```js
const longData = FileAttachment("data/all-conversations.long.json").json();
```

## Nombre de threads par mois

Voici le nombre de *threads* que j'ai ouverts par mois, sur ChatGPT et Claude :

```js
const threads = aq.from(longData)
        .filter(d => d.metric === 'thread');
```

```js
Plot.plot({
    width: width,
    y: {
        label: "Threads",
        grid: true
    },
    color: {legend: true},
    marks: [
        Plot.ruleY([0]),
        Plot.rectY(
            threads,
            {
                x: d => new Date(d.month),
                y: "value",
                interval: "month",
                fill: "platform",
                tip: true
            }
        )
    ]
})
```


```js
const threadsByMonth = (
        threads.derive({ 
            full_key: d => d.role ? 
                `${d.platform}_${d.role}_${d.metric}` : 
                `${d.platform}_${d.metric}`
        })
        .groupby('month')
        .pivot('full_key', 'value')
        .derive({
            total: d => d.chatgpt_thread + d.claude_thread
        })
)
```

```js
Inputs.table(
    threadsByMonth,
    {
        height: "auto",
        select: false,
        rows: threadsByMonth.numRows()
    }
)
```

## Nombre de mots envoyés et reçus par mois

```js
const words = aq.from(longData)
        .filter(d => d.metric === 'words');
```

### Mots envoyés

```js
Plot.plot({
    width: width,
    y: {
        label: "Mots",
        grid: true
    },
    color: {legend: true},
    marks: [
        Plot.ruleY([0]),
        Plot.rectY(
            words.filter(d => d.role === 'user'),
            {
                x: d => new Date(d.month),
                y: "value",
                interval: "month",
                fill: "platform",
                tip: true
            }
        )
    ]
})
```

### Mots reçus

```js
Plot.plot({
    width: width,
    y: {
        label: "Mots",
        grid: true
    },
    color: {legend: true},
    marks: [
        Plot.ruleY([0]),
        Plot.rectY(
            words.filter(d => d.role === 'assistant'),
            {
                x: d => new Date(d.month),
                y: "value",
                interval: "month",
                fill: "platform",
                tip: true
            }
        )
    ]
})
```
