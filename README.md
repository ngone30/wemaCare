# WemaCARE – Kind AI for Every African Life

**WemaCARE** is an AI-powered, offline-first healthcare navigator designed to help underserved communities in Africa access fast, accurate and culturally-aware diagnosis and support even without internet. 
- It connects patients to the right specialists using intelligent voice, text and image analysis.

> “Wema” means *Kindness* in Swahili — this app is built on empathy, innovation and inclusion.


## Inspiration

Growing up in Africa with my dad being a doctor, I saw firsthand the challenges both patients and healthcare workers face — delayed diagnosis, lack of awareness, stigma and systemic gaps. Some of our own relatives lived for years with untreated conditions. I realized the problem wasn’t just hospitals — it was **access**, **information** and **timing**. 

I dreamed of becoming a doctor. Life led me to engineering instead, but I never left behind my passion for solving healthcare problems. **WemaCARE** is that dream reborn — using tech and kindness to change lives.


## What WemaCARE Does

WemaCARE isn’t just “another health app” — it’s the bridge I wish existed.

- **Image-Based AI Diagnosis**  
  - 📸 Snap a photo of a skin condition and receive an AI-powered diagnosis — even offline.

- **Symptom Checker in Local Languages**  
  - 🗣️ Users can describe symptoms in Swahili, Yoruba, or other languages. Voice and text inputs supported.

- **Smart Specialist Matching**  
  - 🧠 WemaCARE doesn’t say “just see a doctor” — it tells you which doctor, how much they cost, and where they’re located.

- **Wema Notes**  
  - ✍️ Save and send patient summaries via SMS or Bluetooth. Perfect for community health workers.

- **Offline-First Experience**  
  - 🚫 No internet? No problem. WemaCARE works on low-end Android devices with local models under 50MB.


## Tech Stack

| Layer          | Technology Used                             |
|----------------|----------------------------------------------|
| 🖼️ Frontend     | Flutter (Dart), Expo, Figma                 |
| 🧠 AI Models    | Gemini 2.5 Flash, Gemini Lite, Gemma 3      |
| 🔌 AI Runtime   | TensorFlow Lite, MediaPipe                  |
| 🌐 Backend      | Node.js, Express.js                         |
| 💾 Storage      | SQLite (offline), Firebase (optional sync) |
| 🛰️ Connectivity | Google Maps API, SMS API, Bluetooth         |
| 🗣️ Voice Input  | Google Speech-to-Text API                   |
| 🧪 Others       | TypeScript, JSON, StitchAI                  |


## How We Built It

- Transitioned from Python to **React Native**, and finally **Flutter** for offline capability.
- Optimized everything for Africa’s reality: models under 50MB, low memory usage, local caching.
- Used Arduino learnings to optimize for battery and performance.
- Built three AI models to handle multimodal input (voice, text, image).
- Prioritized multilingual and offline-first design from day one.


## AI Models Used

- **Gemini 2.5 Flash** – Complex voice + image + text diagnosis
- **Gemini 2.0 Flash-Lite** – Lightweight for fast use on low-end phones
- **Gemma 3** – Designed for emergencies in offline mode


## Challenges We Faced

- Designing fully offline AI services.
- Emotional toll of researching preventable deaths.
- Compressing multi-modal AI into mobile-friendly packages.
- Adapting for communities and conditions we hadn't personally experienced.
- Balancing school, C++ hardware learning, and building WemaCARE — all at once.


## Accomplishments We're Proud Of

- Built a working prototype in **under 3 days** after pivoting late in the hackathon.
- Created three optimized AI models that run offline.
- Designed a culturally relevant and inclusive health experience.
- Never gave up — even when everything seemed impossible.


## What We Learned

- Perseverance and grit under pressure.
- How to translate empathy into design and code.
- That innovation only matters if it works in the hands of those who need it most.


## What’s Next for WemaCARE

- 🎯 Launch pilot across **Kenya, Nigeria, and Senegal**
- 🤝 Partner with clinics to integrate WemaCARE into workflows
- 📊 Aggregate anonymous data for public health insights
- 🌞 Explore solar-powered health kiosks
- 🔬 Build low-cost diagnostic hardware using mechatronics background
- 🎙️ Voice-first updates and mental health add-ons


## 🌍 Why WemaCARE Matters

We dream of a future where **every African child, parent, and grandparent** has access to smart, kind, affordable healthcare — whether they’re in Nairobi or rural Chad.

> WemaCARE is just the beginning.  
> Technology made for **humanity** — not just profit.


## Demo & Landing Page

- 🔗 Landing Page[click to view](https://wema-care.netlify.app/)
- 🎥 Demo Video: [click to view](https://youtu.be/srX_OrCV0hE/)


## Team WemaCARE

| Name     | Role                        | Social Links |
|----------|-----------------------------|--------------|
| **Eric Nzyoka** | Backend + AI Integration + Communication | [GitHub](https://github.com/nzyoka10) · [LinkedIn](https://linkedin.com/in/ericnzyoka) |
| **Becky** | UI/UX + Frontend + Note Sharing  | [GitHub](https://github.com/cheropbecky) . [LinkedIn](https://www.linkedin.com/in/cheropbecky) |
| **Rosalie** | Symptom Checker + Prompt Logic + Picth Deck | [GitHub](https://github.com/ngone30) . [LinkedIn](https://www.linkedin.com/in/ngoné-thiam-3873942b4) |


## License

MIT License – Feel free to use, modify, and contribute.


## Built With

<p align="left">

  <a href="https://flutter.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter" />
  </a>

  <a href="https://www.tensorflow.org/lite" target="_blank">
    <img src="https://img.shields.io/badge/TensorFlow_Lite-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow Lite" />
  </a>

  <a href="https://firebase.google.com/" target="_blank">
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  </a>

  <a href="https://deepmind.google/technologies/gemini/" target="_blank">
    <img src="https://img.shields.io/badge/Gemini%20API-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini API" />
  </a>

  <a href="https://nodejs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  </a>

  <a href="https://www.sqlite.org/" target="_blank">
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  </a>

  <a href="https://cloud.google.com/speech-to-text" target="_blank">
    <img src="https://img.shields.io/badge/Speech--to--Text-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Speech-to-Text" />
  </a>

  <a href="https://figma.com/" target="_blank">
    <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white" alt="Figma" />
  </a>

  <a href="https://stitch-ai.com/" target="_blank">
    <img src="https://img.shields.io/badge/StitchAI-5E60CE?style=for-the-badge" alt="StitchAI" />
  </a>

  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>

  <a href="https://expo.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  </a>

</p>



