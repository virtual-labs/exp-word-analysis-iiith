Analysis of a word into root and affix(es) is called as Morphological analysis of a word. It is mandatory to identify root of a word for any natural language processing task. A root word can have various forms. For example, the word 'play' in English has the following forms: 'play', 'plays', 'played' and 'playing'. Hindi shows more number of forms for the word 'खेल' (khela) which is equivalent to 'play'. The forms of 'खेल'(khela) are the following:

 खेल(khela), खेला(khelaa), खेली(khelii), खेलूंगा(kheluungaa), खेलूंगी(kheluungii), खेलेगा(khelegaa), खेलेगी(khelegii), खेलते(khelate), खेलती(khelatii), खेलने(khelane), खेलकर(khelakar)

For Telugu root ఆడడం (Adadam), the forms are the following::

Adutaanu, AdutunnAnu, Adenu, Ademu, AdevA, AdutAru, Adutunnaru, AdadAniki, Adesariki, AdanA, Adinxi, Adutunxi, AdinxA, AdeserA, Adestunnaru, ...

Thus we understand that the morphological richness of one language might vary from one language to another. Indian languages are generally morphologically rich languages and therefore morphological analysis of words becomes a very significant task for Indian languages.

**Types of Morphology**

Morphology is of two types,

1. Inflectional morphology

Deals with word forms of a root, where there is no change in lexical category. For example, 'played' is an inflection of the root word 'play'. Here, both 'played' and 'play' are verbs.

2. Derivational morphology

Deals with word forms of a root, where there is a change in the lexical category. For example, the word form 'happiness' is a derivation of the word 'happy'. Here, 'happiness' is a derived noun form of the adjective 'happy'.

**Morphological Features**:

All words will have their lexical category attested during morphological analysis.
A noun and pronoun can take suffixes of the following features: gender, number, person, case
For example, morphological analysis of a few words is given below:

|Language|input:word|output:analysis|
|---|---|---|
|Hindi|लडके (ladake)|rt=लड़का(ladakaa), cat=n, gen=m, num=sg, case=obl|
|Hindi|	लडके (ladake)|rt=लड़का(ladakaa), cat=n, gen=m, num=pl, case=dir|
|Hindi|लड़कों (ladakoM)|rt=लड़का(ladakaa), cat=n, gen=m, num=pl, case=obl|
|English|boy|rt=boy, cat=n, gen=m, num=sg|
|English|boys|rt=boy, cat=n, gen=m, num=pl|


A verb can take suffixes of the following features: tense, aspect, modality, gender, number, person


|Language|input:word|output:analysis|
|---|---|---|
|Hindi|हँसी(hansii)|rt=हँस(hans), cat=v, gen=fem, num=sg/pl, per=1/2/3 tense=past, aspect=pft|
|English|toys|rt=toy, cat=n, num=pl, per=3|


'rt' stands for root. 'cat' stands for lexical category. Thev value of lexicat category can be noun, verb, adjective, pronoun, adverb, preposition. 'gen' stands for gender. The value of gender can be masculine or feminine.
'num' stands for number. The value of number can be singular (sg) or plural (pl).
'per' stands for person. The value of person can be 1, 2 or 3

The value of tense can be present, past or future. This feature is applicable for verbs.
The value of aspect can be perfect (pft), continuous (cont) or habitual (hab). This feature is not applicable for verbs.

'case' can be direct or oblique. This feature is applicable for nouns. A case is an oblique case when a postposition occurs after noun. If no postposition can occur after noun, then the case is a direct case. This is applicable for hindi but not english as it doesn't have any postpositions. Some of the postpsitions in hindi are: का(kaa), की(kii), के(ke), को(ko), में(meM)
