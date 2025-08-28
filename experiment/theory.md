Morphological analysis is a foundational task in Natural Language Processing (NLP). It involves breaking down a word into its root and affix(es), which is essential for understanding word structure and meaning in any language.

---

#### 1. Morphological Analysis

Morphological analysis involves breaking a word into its root and affix(es). Identifying the root of a word is a fundamental step in many NLP tasks.

#### Example: Word Forms Across Languages

- **English:**
  - Root: 'play'
  - Forms: 'play', 'plays', 'played', 'playing'
- **Hindi:**
  - Root: 'खेल' (khela)
  - Forms: खेल, खेला, खेली, खेलूंगा, खेलूंगी, खेलेगा, खेलेगी, खेलते, खेलती, खेलने, खेलकर
- **Telugu:**
  - Root: ఆడడం (Adadam)
  - Forms: ఆడుతాను, ఆడుతున్నాను, ఆడేను, ఆడేవా, ...

---

#### 2. Morphological Richness

The number of forms a root word can take varies across languages. Indian languages are generally considered _morphologically rich_, meaning words can have many forms due to inflections and derivations.

---

#### 3. Types of Morphology

#### **Inflectional Morphology**

- Deals with word forms of a root where there is **no change in lexical category**.
- Example: 'played' is an inflection of 'play' (both are verbs).

#### **Derivational Morphology**

- Deals with word forms of a root where there **is a change in lexical category**.
- Example: 'happiness' is a derivation of 'happy' (adjective → noun).

---

#### 4. Morphological Features

During morphological analysis, each word is assigned a _lexical category_ and may take suffixes for features such as gender, number, person, case, tense, aspect, and modality.

#### **Nouns & Pronouns**

- Can take suffixes for: **gender, number, person, case**

##### Example Analyses

| Language | Input Word       | Output Analysis                                   |
| -------- | ---------------- | ------------------------------------------------- |
| Hindi    | लड़के (ladake)    | rt=लड़का(ladakaa), cat=n, gen=m, num=sg, case=obl |
| Hindi    | लड़के (ladake)    | rt=लड़का(ladakaa), cat=n, gen=m, num=pl, case=dir |
| Hindi    | लड़कों (ladakoM) | rt=लड़का(ladakaa), cat=n, gen=m, num=pl, case=obl |
| English  | boy              | rt=boy, cat=n, gen=m, num=sg                      |
| English  | boys             | rt=boy, cat=n, gen=m, num=pl                      |

#### **Verbs**

- Can take suffixes for: **tense, aspect, modality, gender, number, person**

##### Example Analyses

| Language | Input Word   | Output Analysis                                                           |
| -------- | ------------ | ------------------------------------------------------------------------- |
| Hindi    | हंसी(hansii) | rt=हंस(hans), cat=v, gen=fem, num=sg/pl, per=1/2/3 tense=past, aspect=pft |
| English  | toys         | rt=toy, cat=n, num=pl, per=3                                              |

---

#### 5. Feature References

- **rt**: root
- **cat**: lexical category (noun, verb, adjective, pronoun, adverb, preposition)
- **gen**: gender (masculine or feminine)
- **num**: number (singular (sg) or plural (pl))
- **per**: person (1, 2, or 3)
- **tense**: present, past, or future (for verbs)
- **aspect**: perfect (pft), continuous (cont), or habitual (hab) (for verbs)
- **case**: direct or oblique (for nouns)

**Note:**

- A case is _oblique_ when a postposition occurs after a noun. If no postposition can occur after a noun, the case is _direct_.
- Some Hindi postpositions: का(kaa), की(kii), के(ke), को(ko), में(meM)

---

#### 6. Summary

Morphological analysis is crucial for understanding and processing natural language, especially in morphologically rich languages like Hindi and Telugu. By breaking words into their roots and features, we can better analyze, translate, and generate language computationally.
