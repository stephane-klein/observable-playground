# Mes conversations IA

Cette page contient quelques statistiques de mon utilisation d'agents conversationnels.

## Nombre de threads par mois

Voici le nombre de *threads* que j'ai ouvert par mois, sur ChatGPT et Claude :

```js
const data = FileAttachment("data/all-conversations.json").json();
```

```js
Plot.plot({
    width: width,
    y: {
        label: "Threads",
        grid: true
    },
    marks: [
        Plot.ruleY([0]),
        Plot.lineY(
            data,
            {
                x: d => new Date(d.month),
                y: "total_threadCount"
            }
        )
    ]
})
```

```js
Inputs.table(
    data,
    {
        columns: [
            "month",
            "chatgpt_threadCount",
            "claude_threadCount",
            "total_threadCount"
        ],
        header: {
            month: "Mois",
            "chatgpt_threadCount": "ChatGPT",
            "claude_threadCount": "Claude",
            "total_threadCount": "Total"
        },
        height: "auto",
        rows: data.length,
        select: false
    }
)
```

Attention, depuis juin 2025, j'ai migré vers [Open WebUI](https://openwebui.com/) couplé avec [OpenRouter](https://openrouter.ai/) et [LMArena](https://lmarena.ai/) que je n'ai pas encore inclus dans ce tableau. Je pense les intégrer prochainement.

## Nombre par mots envoyés et reçu

```js
Plot.legend({color: {domain: ["Utilisateur", "Assitant"], range: ["red", "blue"]}})
```

```js
Plot.plot({
    width: width,
    y: {
        label: "Mots",
        grid: true
    },
    marks: [
        Plot.ruleY([0]),
        Plot.lineY(
            data,
            {
                x: d => new Date(d.month),
                y: "total_userWordsCount",
                stroke: "red"
            }
        ),
        Plot.lineY(
            data,
            {
                x: d => new Date(d.month),
                y: "total_assistantWordsCount",
                stroke: "blue"
            }
        )
    ]
})
```

```js
Inputs.table(
    data,
    {
        columns: [
            "month",
            "total_userWordsCount",
            "total_assistantWordsCount"
        ],
        header: {
            month: "Mois",
            "total_userWordsCount": "Total User Words count",
            "total_assistantWordsCount": "Total assistant Words count"
        },
        height: "auto",
        rows: data.length,
        select: false
    }
)
```

