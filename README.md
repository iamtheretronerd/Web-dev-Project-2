## 📌 Author & Class Info

- **Author:** Hemang Murugan & Adrian Halgas
- **Class:** Web Development — Northeastern University
- **Date:** 11 October 2025
- [Class Link](https://johnguerra.co/classes/webDevelopment_online_fall_2025/)

---



TODO: Missing the screenshot

# 🎯 Project Objective

**An Open Idea-Sharing Platform for Creators and Critics**

The 9th Seat is a collaborative idea-exchange platform where creators can post their concepts and receive structured critique from others — taking the role of the “Devil’s Advocate.”  
Inspired by Japanese innovation culture, the “ninth seat” at every meeting is reserved for the critic — ensuring every idea is challenged before it grows. This project is built using **Express + Node**, **MongoDB**, **HTML5**, **CSS3**, and **ES6+ JavaScript**

---

## 🎥 Presentation Link

🔗 [Google Slides Presentation](https://docs.google.com/presentation/d/1bgYqs0vqRMKrvgfNhzcTav2JTphsTHHIHN1LZYuOjqA/edit?usp=sharing)

---

## 🛠️ Instructions to Build / Run

### Prerequisites

- **Node.js** (v18 or later)
- **MongoDB Atlas** or local Mongo instance
- **Git** (for cloning)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/iamtheretronerd/Web-dev-Project-2.git
   cd Web-dev-Project-2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory:

   ```env
   PORT=3000
   MONGODB_URI=<your Mongo connection string>
   NODE_ENV=development
   ```

4. **Run in development mode**

   ```bash
   npm run dev
   ```

   or **start the production server**

   ```bash
   npm start
   ```

5. **Access the app**
   - Open your browser and visit:  
     👉 http://localhost:3000

---

## 📋 Assignment Rubric Checklist

| Criterion                                  | Status | Notes / Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :----------------------------------------- | :----: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design Document**                        |   ✅   | [View PDF](./submissions/Design-Document.pdf)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **App accomplishes approved requirements** |   ✅   | All 9th Seat features from the approved proposal implemented:<br><ul><li>✅ **Sign Up / Login / Profile** — user authentication and profile editing.</li><li>✅ **Post and Manage Ideas** — create, edit, delete posts with title and description.</li><li>✅ **Commenting (“Take the Devil’s Seat”)** — users can critique ideas via comments and replies.</li><li>✅ **Upvote System** — upvote ideas and comments to reward insight.</li><li>✅ **Search and Filter** — search by title and filter posts (All, My Posts, Top Rated).</li><li>✅ **Home Page Feed** — displays all ideas with title, author, and upvotes.</li><li>✅ **Profile Editing** — edit user name, email, password, and avatar.</li> <li>✅ **AI-Driven Assistant** — implemented experimental feature where an AI analyzes all user comments and critiques, then automatically refines and rewrites the innovator’s original idea into an improved version based on community feedback.</li> </ul> |
| **Usable + includes instructions**         |   ✅   | The application works intuitively after testing, and detailed [usage instructions](#instructions-on-using-the-application) are provided below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Actually useful**                        |   ✅   | “Devil’s advocate” concept is really helpful to let companies think from a different perspective. It's an idealogy followed by the Japanese and something that can help building better products by knowing how people might think before actually building it!                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **ESLint config (no errors)**              |   ✅   | `.eslint.config.js` present, no lint issues.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Code organization (pages, DB, CSS)**     |   ✅   | Code follows modular separation ([`/routes`](./routes/), [`/db`](./db/), [`/frontend`](./frontend/), [`/css`](./frontend/css/), [`/js`](./frontend/js/)).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **JS modules (database connector)**        |   ✅   | `myMongoDB.js`, `postsDB.js`, modular ES imports.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Client-side rendering (vanilla JS)**     |   ✅   | `dashboard.js`, `post.js` dynamically render content.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Implements ≥1 form**                     |   ✅   | Multiple (`signup`, `login`, `editpost`, `comment`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Deployed publicly**                      |   ✅   | [VISIT](https://ninthseat.onrender.com/) Deployed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **≥2 Mongo collections + CRUD**            |   ✅   | Users + Posts (+ Comments).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Database > 1000 records**                |   ✅   | [View](https://ninthseat.onrender.com/api/posts/count)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Uses Node + Express**                    |   ✅   | Confirmed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Formatted with Prettier**                |   ✅   | `prettier --write .` executed successfully.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **No non-standard tags**                   |   ✅   | Only valid HTML elements used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **CSS modular organization**               |   ✅   | Each HTML has its own CSS file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Clear README**                           |   ✅   | This file fulfills that requirement.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **No exposed credentials**                 |   ✅   | `.env` ignored in `.gitignore`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **package.json with deps**                 |   ✅   | Verified.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **MIT License**                            |   ✅   | `LICENSE` file present.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **No leftover code**                       |   ✅   | Clean project, no unused routes or templates.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Google Form submission**                 |   ✅   | Thumbnail + links verified                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Public narrated video**                  |   ✅   | [View](https://youtu.be/8nmAnkLWdM4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Code frozen on time**                    |   ✅   | Done deadline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Backend uses ES modules**                |   ✅   | All imports/exports use ESM syntax.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **No Mongoose / Template Engines**         |   ✅   | Uses raw MongoDB driver only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **W3C Compliant**                          |   ✅   | (Validated at [validator.w3.org](https://validator.w3.org/)) only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

---

## Instructions on Using the Application

When the application loads, you are presented with a **splash page** featuring a “Get Started” button.

1. **Sign Up / Login**
   - Click **Get Started**.
   - If you don’t have an account, click **Sign Up** and create one by entering your **name, email, and password**.
   - Once registered, you’ll be redirected to the **Login** page — enter your credentials to sign in.
   - The login state is persistent, so you remain logged in across sessions.

2. **Dashboard Overview**
   - After logging in, you’ll be taken to the **Dashboard**, which displays your **profile picture, name, and a Logout button** in the header.
   - Click on your **profile picture** to open the **Edit Profile** screen, where you can update your name, email, or password.
   - Click **Logout** in the header to securely sign out.

3. **Search and Filtering**
   - Use the **search bar** to find posts by title.
   - Click **Search** after typing your query.
   - Click **Clear** to reset the results.
   - You can also switch between three filters:
     - **All Posts** – displays all ideas.
     - **My Posts** – shows posts created by the logged-in user.
     - **Top Rated** – sorts posts by the number of upvotes.

4. **Creating a Post**
   - Use the **Create Post** form below the search bar to submit a new idea.
   - Enter the **title** and **description**, then click **Create Post**.
   - The new post will appear immediately in the feed.

5. **Managing Posts**
   - Posts created by you will have **Edit** and **Delete** options.
   - Clicking **Edit** takes you to a dedicated page where you can modify the post details.
   - Clicking **Delete** permanently removes the post.

6. **Viewing and Interacting with Posts**
   - Each post displays its **title**, **creator**, **upvote count**, and **number of comments**.
   - Clicking on a post opens the **Post Detail page**, where you can:
     - Read and write **comments**.
     - **Reply** to existing comments.
     - **Upvote** the post or insightful comments.

This structure ensures a smooth and intuitive user experience for all four personas: creators, challengers, mentors, and observers.

---

## 🤖 GenAI Usage

This project used **GenAI tools** (ChatGPT / GPT-5) for:

- Brainstorming, code reviews, and documentation refinement.
- Validating accessibility, semantic HTML, and ESLint/Prettier consistency.

**Prompts Used:**

> “Review my code file for semantic structure, accessibility issues, and best practices.”

**The below prompt is used in the API to generate AI-based idea**

> "Based on the original idea and the community's devil's advocate critiques, suggest ONE specific, actionable improvement or pivot for this project. Keep your suggestion concise (2-3 sentences) and practical. Focus on addressing the main concerns raised while preserving the core value of the original idea. If there is no enough information or critiques, suggest a general improvement"

**Validation:**  
All outputs were manually reviewed, iterated, and integrated **only after confirming**:

- Compliance with semantic **HTML5** and **accessibility** standards
- ESLint / Prettier formatting rules
- Academic integrity and rubric compliance

---

## 📜 Copyrights & Attributions

- **Cover Image:** Landing page background sourced from  
  🔗 [The Pattern Library](http://thepatternlibrary.com/)
- A complete list of credits and licenses can be found here:  
  👉 [Credits Page](./credits.html)

---

## 👤 Authors

**Hemang Murugan**  
MS in Computer Science, Northeastern University (Khoury College)  
Course: _CS5610 — Web Development_

**Adrian Halgas**  
MS in Computer Science, Northeastern University (Khoury College)  
Course: _CS5610 — Web Development_

---

## Login Details

Use any of these test accounts to sign in or feel free to create an account.

| Email                      | Password   |
| -------------------------- | ---------- |
| ava.thompson@gmail.com     | `12345678` |
| ethan.miller@gmail.com     | `12345678` |
| sophia.chen@gmail.com      | `12345678` |
| liam.rodriguez@gmail.com   | `12345678` |
| isabella.patel@gmail.com   | `12345678` |
| noah.nguyen@gmail.com      | `12345678` |
| mia.johnson@gmail.com      | `12345678` |
| lucas.anderson@gmail.com   | `12345678` |
| charlotte.davis@gmail.com  | `12345678` |
| oliver.lee@gmail.com       | `12345678` |
| amelia.garcia@gmail.com    | `12345678` |
| elijah.brown@gmail.com     | `12345678` |
| harper.wilson@gmail.com    | `12345678` |
| james.martinez@gmail.com   | `12345678` |
| evelyn.walker@gmail.com    | `12345678` |
| henry.kim@gmail.com        | `12345678` |
| abigail.rivera@gmail.com   | `12345678` |
| william.clark@gmail.com    | `12345678` |
| ella.adams@gmail.com       | `12345678` |
| benjamin.lopez@gmail.com   | `12345678` |
| grace.hall@gmail.com       | `12345678` |
| alexander.young@gmail.com  | `12345678` |
| scarlett.perez@gmail.com   | `12345678` |
| daniel.sanchez@gmail.com   | `12345678` |
| victoria.ramirez@gmail.com | `12345678` |
| matthew.scott@gmail.com    | `12345678` |
| luna.king@gmail.com        | `12345678` |
| jack.nguyen@gmail.com      | `12345678` |
| chloe.barnes@gmail.com     | `12345678` |
| logan.torres@gmail.com     | `12345678` |

---

## 🪪 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
