from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Load vet data from JSON
with open('clinics.json', 'r') as f:
    clinics = json.load(f)

# Step 1 options
conditions = {
    "injured": ["🩸 Fracture / limb injury", "🐾 Wound / cut / bleeding", "🦷 Dental injury"],
    "weak": ["🤢 Vomiting / not eating", "🦠 Infection / fever", "💩 Digestive issue"],
    "general": ["💉 Vaccination", "🔬 Regular checkup", "🧼 Grooming"]
}

# Step 3 area groups
areas = [
    "Kothrud / Karve Nagar / Paud Phata",
    "Baner / Aundh / Pashan",
    "Viman Nagar / Kalyani Nagar / Kharadi",
    "Hadapsar / Magarpatta / Fursungi",
    "Undri / NIBM / Sasane Nagar",
    "Wakad / Pimple Saudagar / Kalewadi",
    "Chinchwad / Sambhaji Nagar / Kalewadi",
    "Katraj / Dhankawadi / Satara Road",
    "Bavdhan / Warje / Manik Baug",
    "Bund Garden / Sassoon Road / Camp"
]

# --- Helper Functions ---
def match_speciality(symptom, speciality_text):
    symptom = symptom.lower()
    speciality_text = speciality_text.lower()
    keywords = {
        "fracture": ["ortho", "surgery", "orthopedic", "bone"],
        "wound": ["surgery", "bandage", "emergency", "care"],
        "dental": ["dental", "tooth", "oral"],
        "vomiting": ["medicine", "internal", "diagnostic"],
        "infection": ["fever", "infection", "diagnostic"],
        "digestive": ["gastro", "stomach", "internal"],
        "vaccination": ["vaccination", "vaccine"],
        "checkup": ["checkup", "general", "consultation"],
        "grooming": ["grooming", "spa", "cleaning"]
    }

    for key, words in keywords.items():
        if key in symptom:
            return any(w in speciality_text for w in words)
    return False

def area_match(selected_area, clinic_area):
    selected_area = selected_area.lower()
    clinic_area = clinic_area.lower()
    for part in selected_area.split("/"):
        if part.strip() in clinic_area:
            return True
    return False

# --- Routes ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message', '').lower()
    step = request.json.get('step', 1)
    context = request.json.get('context', {})

    if step == 1:
        if "injured" in user_input:
            context["condition"] = "injured"
        elif "weak" in user_input:
            context["condition"] = "weak"
        else:
            context["condition"] = "general"

        return jsonify({
            "reply": "Please choose a symptom 👇",
            "options": conditions[context["condition"]],
            "next_step": 2,
            "context": context
        })

    elif step == 2:
        context["symptom"] = user_input
        return jsonify({
            "reply": "Got it! Can you please choose your area 🏙️",
            "options": areas,
            "next_step": 3,
            "context": context
        })

    elif step == 3:
        context["area"] = user_input
        symptom = context.get("symptom", "")
        selected_area = context.get("area", "")

        results = []
        for vet in clinics:
            if area_match(selected_area, vet["area"]) and match_speciality(symptom, vet["speciality"]):
                results.append(vet)

        if results:
            reply_lines = []
            for v in results[:5]:
                maps_query = f"https://www.google.com/maps/search/?api=1&query={v['name'].replace(' ', '+')}+{v['area'].replace(' ', '+')}"
                reply_lines.append(
                    f"🏥 <b>{v['name']}</b><br>"
                    f"⭐ {v['rating']} | 📞 {v['phone']}<br>"
                    f"📍 <a href='{maps_query}' target='_blank' style='color:#8a68ef;text-decoration:none;'>{v['area']} 🔗</a><br>"
                    f"🩺 {v['speciality']}<br>"
                )
            reply_text = "<br><br>".join(reply_lines)
        else:
            reply_text = "😿 No vets found for that symptom in this area."

        return jsonify({
            "reply": reply_text + "<br><br>Would you like to search again?",
            "options": ["🔁 Yes", "❌ No"],
            "next_step": 4,
            "context": context
        })

    elif step == 4:
        if "yes" in user_input:
            return jsonify({
                "reply": "Hi there! 🐾 I’m your Pawfect Aid helper. Let’s find help for your furry friend 💜",
                "options": ["🐕 Injured or bleeding", "🐈 Weak or sick", "🏥 General visit"],
                "next_step": 1,
                "context": {}
            })
        else:
            return jsonify({"reply": "Thank you 💜 Stay safe!", "options": []})

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
