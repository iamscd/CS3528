"""
TODO: Write docstring here
"""
import os
from datetime import datetime, timedelta

# -- import server modules --
import server
import server.logging
from server.models import (
    User, Course, Module, Lesson, LessonQuiz,
    ModuleTest, LessonComment, LessonProgress, Certificate
)
from server.extensions import database

logging = server.logging.get_logger(__name__)


def _seed_initial_data() -> None:
    """Create default users, courses, modules, lessons, quizzes and tests if none exist."""

    if User.query.first():
        logging.info("Seed data skipped: existing users found.")
        return

    logging.info("No users found. Seeding initial dataset...")

    import server.extensions
    bcrypt = server.extensions.bcrypt

    admin_pass = os.getenv("ADMIN_PASSWORD")
    member_pass = os.getenv("MEMBER_PASSWORD")

    if not admin_pass or not member_pass:
        raise RuntimeError("ADMIN_PASSWORD and MEMBER_PASSWORD must be set.")

    # ------------------------------------------------------------------ USERS
    admin = User(
        name="Admin",
        email=os.getenv("ADMIN_EMAIL"),
        password_hash=bcrypt.generate_password_hash(admin_pass).decode("utf-8"),
        role="admin",
    )
    alice = User(
        name="Alice Johnson",
        email=os.getenv("MEMBER_EMAIL"),
        password_hash=bcrypt.generate_password_hash(member_pass).decode("utf-8"),
        role="member",
    )
    sarah = User(
        name="Sarah Mitchell",
        email="sarah@example.com",
        password_hash=bcrypt.generate_password_hash("sarahpass").decode("utf-8"),
        role="member",
    )
    emma = User(
        name="Emma Clarke",
        email="emma@example.com",
        password_hash=bcrypt.generate_password_hash("emmapass").decode("utf-8"),
        role="member",
    )

    database.session.add_all([admin, alice, sarah, emma])
    database.session.commit()
    logging.info("Users created.")

    # ============================================================== COURSE 1
    c1 = Course(
        title="Understanding Endometriosis",
        description="A comprehensive introduction to endometriosis — what it is, how it develops, and why early recognition matters.",
        created_by=admin.id,
    )
    database.session.add(c1)
    database.session.commit()

    # --- Module 1.1 ---
    m1 = Module(title="What is Endometriosis?", description="The basics of endometriosis — definition, prevalence and how it differs from a normal menstrual cycle.", course_id=c1.id, order_index=0)
    database.session.add(m1)
    database.session.commit()

    l1 = Lesson(title="Defining Endometriosis", module_id=m1.id, content_type="text", order_index=0,
        text_content=(
            "Endometriosis is a chronic condition where tissue similar to the lining of the uterus (the endometrium) grows outside the uterus.\n\n"
            "These lesions are most commonly found on:\n"
            "- The ovaries\n"
            "- The fallopian tubes\n"
            "- The outer surface of the uterus\n"
            "- The tissue lining the pelvis (peritoneum)\n\n"
            "Less commonly, lesions can appear on the bowel, bladder, diaphragm, or in rare cases, distant organs.\n\n"
            "Like the normal endometrium, these lesions respond to hormonal changes during the menstrual cycle — they thicken, break down, and bleed. "
            "However, because the blood has no way to leave the body, it can cause inflammation, scar tissue (adhesions), and cysts called endometriomas.\n\n"
            "Endometriosis affects approximately 1 in 10 people assigned female at birth of reproductive age — around 190 million worldwide."
        ))
    l2 = Lesson(title="Causes and Risk Factors", module_id=m1.id, content_type="text", order_index=1,
        text_content=(
            "The exact cause of endometriosis is not fully understood, but several theories exist:\n\n"
            "Retrograde menstruation (most widely accepted):\n"
            "  Menstrual blood flows backwards through the fallopian tubes into the pelvic cavity, where endometrial cells implant and grow.\n\n"
            "Immune system dysfunction:\n"
            "  A weakened immune system may fail to identify and destroy endometrial cells growing outside the uterus.\n\n"
            "Genetic factors:\n"
            "  Endometriosis tends to run in families. Having a first-degree relative with the condition significantly increases your risk.\n\n"
            "Metaplasia:\n"
            "  Cells outside the uterus may transform into endometrial-like cells under certain hormonal or environmental triggers.\n\n"
            "Risk factors include:\n"
            "- Family history of endometriosis\n"
            "- Early onset of menstruation (before age 11)\n"
            "- Short menstrual cycles (less than 27 days)\n"
            "- Heavy or prolonged periods\n"
            "- Never having given birth\n\n"
            "Endometriosis is not caused by anything a person did or did not do."
        ))
    l3 = Lesson(title="Stages and Classification", module_id=m1.id, content_type="text", order_index=2,
        text_content=(
            "Endometriosis is classified into four stages by the American Society for Reproductive Medicine (ASRM):\n\n"
            "Stage I — Minimal:\n"
            "  Small, isolated lesions on the pelvic lining or ovaries. No significant adhesions.\n\n"
            "Stage II — Mild:\n"
            "  More lesions, slightly deeper implants, still limited to the pelvis.\n\n"
            "Stage III — Moderate:\n"
            "  Multiple deep lesions, endometriomas on the ovaries, adhesions around the fallopian tubes and ovaries.\n\n"
            "Stage IV — Severe:\n"
            "  Widespread deep lesions, large endometriomas, dense adhesions. May involve the bowel or bladder.\n\n"
            "Important: stage does not directly correlate with pain severity.\n"
            "Someone with Stage I can experience debilitating pain, while someone with Stage IV may have minimal symptoms.\n\n"
            "Staging is only possible through laparoscopy — it cannot be determined from symptoms or imaging alone."
        ))
    database.session.add_all([l1, l2, l3])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l1.id, question="Where does endometriosis-like tissue grow?",
            options=["Inside the uterus only", "Outside the uterus", "Only in the ovaries", "In the bloodstream"], correct_option="B"),
        LessonQuiz(lesson_id=l1.id, question="Approximately how many people worldwide are affected by endometriosis?",
            options=["10 million", "50 million", "190 million", "500 million"], correct_option="C"),
        LessonQuiz(lesson_id=l2.id, question="Which theory of endometriosis is most widely accepted?",
            options=["Genetic mutation", "Retrograde menstruation", "Viral infection", "Hormonal overdose"], correct_option="B"),
        LessonQuiz(lesson_id=l2.id, question="Which of these is a known risk factor for endometriosis?",
            options=["Late onset of menstruation", "Long menstrual cycles", "Family history of the condition", "High body weight"], correct_option="C"),
        LessonQuiz(lesson_id=l3.id, question="How many stages does the ASRM classification system have?",
            options=["Two", "Three", "Four", "Five"], correct_option="C"),
        LessonQuiz(lesson_id=l3.id, question="What procedure is required to definitively stage endometriosis?",
            options=["Ultrasound", "MRI scan", "Blood test", "Laparoscopy"], correct_option="D"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m1.id, question="What is endometriosis?",
            option_a="A bacterial infection of the uterus",
            option_b="Tissue similar to the uterine lining growing outside the uterus",
            option_c="A benign tumour inside the uterus",
            option_d="A hormonal imbalance with no physical lesions",
            correct_option="B"),
        ModuleTest(module_id=m1.id, question="Approximately what proportion of people assigned female at birth of reproductive age have endometriosis?",
            option_a="1 in 100", option_b="1 in 50", option_c="1 in 10", option_d="1 in 3", correct_option="C"),
        ModuleTest(module_id=m1.id, question="Which stage of endometriosis involves widespread deep lesions and large endometriomas?",
            option_a="Stage I", option_b="Stage II", option_c="Stage III", option_d="Stage IV", correct_option="D"),
        ModuleTest(module_id=m1.id, question="Does the stage of endometriosis directly determine the severity of pain?",
            option_a="Yes, higher stage always means more pain",
            option_b="No, pain severity does not directly correlate with stage",
            option_c="Only in Stage III and IV",
            option_d="Yes, Stage I is always painless",
            correct_option="B"),
    ])
    database.session.commit()

    # --- Module 1.2 ---
    m2 = Module(title="Recognising the Symptoms", description="Common and less-known symptoms of endometriosis, and why diagnosis is often delayed.", course_id=c1.id, order_index=1)
    database.session.add(m2)
    database.session.commit()

    l4 = Lesson(title="Common Symptoms", module_id=m2.id, content_type="text", order_index=0,
        text_content=(
            "Symptoms of endometriosis vary widely between individuals. Some people have severe symptoms; others have none at all.\n\n"
            "Most common symptoms:\n\n"
            "Dysmenorrhoea (painful periods):\n"
            "  Pain that is significantly worse than typical period cramps, often disabling. May start before the period and last several days.\n\n"
            "Chronic pelvic pain:\n"
            "  Persistent pain in the lower abdomen or pelvis, not only during menstruation.\n\n"
            "Dyspareunia (pain during or after sex):\n"
            "  Particularly common with deep penetration. Often indicates lesions in the recto-vaginal area.\n\n"
            "Dysuria and dyschezia:\n"
            "  Painful urination or bowel movements, especially during menstruation. Can indicate bladder or bowel involvement.\n\n"
            "Heavy menstrual bleeding (menorrhagia):\n"
            "  Unusually heavy periods, sometimes with clotting.\n\n"
            "Fatigue:\n"
            "  Chronic exhaustion that does not improve with rest is a frequently overlooked symptom.\n\n"
            "Infertility:\n"
            "  Endometriosis is found in 30–50% of people experiencing difficulty conceiving."
        ))
    l5 = Lesson(title="The Diagnostic Delay", module_id=m2.id, content_type="text", order_index=1,
        text_content=(
            "One of the most significant challenges with endometriosis is the time it takes to receive a diagnosis.\n\n"
            "Average diagnostic delay: 7–10 years from symptom onset to confirmed diagnosis.\n\n"
            "Why does this happen?\n\n"
            "Symptom normalisation:\n"
            "  Painful periods are often dismissed as 'normal' by both patients and healthcare providers.\n\n"
            "Lack of awareness:\n"
            "  Many GPs and even some gynaecologists have limited training in endometriosis.\n\n"
            "Symptom overlap:\n"
            "  Symptoms mimic other conditions such as IBS, pelvic inflammatory disease, ovarian cysts, and interstitial cystitis.\n\n"
            "Imaging limitations:\n"
            "  Standard ultrasounds can miss most endometriosis lesions. Only a laparoscopy provides a definitive diagnosis.\n\n"
            "Impact of delay:\n"
            "  Longer delays are associated with disease progression, reduced fertility, and significant impact on quality of life, mental health, education, and careers.\n\n"
            "What you can do:\n"
            "  Keep a symptom diary. Be specific with your doctor. Ask for a referral to a specialist if symptoms persist."
        ))
    database.session.add_all([l4, l5])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l4.id, question="What is dysmenorrhoea?",
            options=["Painful urination", "Painful periods", "Pain during sex", "Painful bowel movements"], correct_option="B"),
        LessonQuiz(lesson_id=l4.id, question="In what percentage of people experiencing infertility is endometriosis found?",
            options=["5–10%", "10–20%", "30–50%", "70–80%"], correct_option="C"),
        LessonQuiz(lesson_id=l5.id, question="What is the average diagnostic delay for endometriosis?",
            options=["1–2 years", "3–4 years", "5–6 years", "7–10 years"], correct_option="D"),
        LessonQuiz(lesson_id=l5.id, question="Which procedure provides a definitive diagnosis of endometriosis?",
            options=["Blood test", "Standard ultrasound", "Laparoscopy", "MRI scan"], correct_option="C"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m2.id, question="Which symptom involves pain during or after sexual intercourse?",
            option_a="Dysmenorrhoea", option_b="Dysuria", option_c="Dyspareunia", option_d="Dyschezia", correct_option="C"),
        ModuleTest(module_id=m2.id, question="Why are painful periods often not investigated early?",
            option_a="They are always mild in endometriosis", option_b="They are frequently normalised by patients and doctors", option_c="There is a reliable blood test available", option_d="Periods are not related to endometriosis", correct_option="B"),
        ModuleTest(module_id=m2.id, question="What does menorrhagia refer to?",
            option_a="Absence of periods", option_b="Irregular periods", option_c="Painful periods", option_d="Heavy menstrual bleeding", correct_option="D"),
        ModuleTest(module_id=m2.id, question="What is one helpful tool for communicating symptoms to a doctor?",
            option_a="A symptom diary", option_b="A fitness tracker", option_c="A hormone blood test", option_d="An ultrasound report", correct_option="A"),
    ])
    database.session.commit()

    # ============================================================== COURSE 2
    c2 = Course(
        title="Treatment Options for Endometriosis",
        description="An overview of medical and surgical treatments available for endometriosis, including how to work with your healthcare team.",
        created_by=admin.id,
    )
    database.session.add(c2)
    database.session.commit()

    # --- Module 2.1 ---
    m3 = Module(title="Medical Management", description="Hormonal therapies and pain relief used to manage endometriosis.", course_id=c2.id, order_index=0)
    database.session.add(m3)
    database.session.commit()

    l6 = Lesson(title="Hormonal Treatments", module_id=m3.id, content_type="text", order_index=0,
        text_content=(
            "Because endometriosis lesions respond to oestrogen, many treatments aim to reduce oestrogen levels or suppress the menstrual cycle.\n\n"
            "Combined oral contraceptive pill (COCP):\n"
            "  Often the first-line hormonal treatment. Can reduce pain and bleeding. Taken continuously (without breaks) to suppress periods.\n\n"
            "Progestogens (e.g. norethisterone, the mini pill, Mirena IUS):\n"
            "  Suppress the endometrium. The Mirena coil delivers progestogen locally and is effective for many people.\n\n"
            "GnRH analogues (e.g. goserelin, leuprorelin):\n"
            "  Create a temporary menopause-like state by suppressing oestrogen production. Very effective but cause side effects such as hot flushes and bone density loss. Usually used short-term with 'add-back' HRT.\n\n"
            "Dienogest:\n"
            "  A progestogen specifically licensed for endometriosis in many countries. Shown to reduce lesion size and pain.\n\n"
            "Important: hormonal treatments manage symptoms but do not cure endometriosis. Symptoms often return after stopping treatment."
        ))
    l7 = Lesson(title="Pain Management", module_id=m3.id, content_type="text", order_index=1,
        text_content=(
            "Pain management is a core part of living with endometriosis and is often used alongside hormonal or surgical treatment.\n\n"
            "NSAIDs (Non-steroidal anti-inflammatory drugs):\n"
            "  Ibuprofen and naproxen reduce prostaglandin production, which drives menstrual pain. Most effective when started 1–2 days before period onset. Should be taken with food.\n\n"
            "Paracetamol:\n"
            "  Useful for mild to moderate pain. Can be combined with NSAIDs.\n\n"
            "Nerve pain medications:\n"
            "  Amitriptyline, gabapentin, and pregabalin are sometimes prescribed for persistent pelvic pain, particularly when nerve involvement is suspected.\n\n"
            "Opioids:\n"
            "  Used for severe flares in some cases, but long-term use carries risks of dependency and may not be appropriate for chronic pain management.\n\n"
            "Pelvic physiotherapy:\n"
            "  A specialist pelvic floor physiotherapist can address muscle tension, adhesion-related pain, and provide tailored exercise programmes.\n\n"
            "Complementary approaches:\n"
            "  TENS machines, heat therapy, acupuncture, and mindfulness-based pain management have evidence of benefit for some individuals."
        ))
    database.session.add_all([l6, l7])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l6.id, question="Why is oestrogen suppression used in endometriosis treatment?",
            options=["To increase fertility", "Because lesions respond to oestrogen", "To cure the condition permanently", "To prevent retrograde menstruation"], correct_option="B"),
        LessonQuiz(lesson_id=l6.id, question="What effect do GnRH analogues have on the body?",
            options=["They stimulate ovulation", "They create a temporary menopause-like state", "They permanently remove lesions", "They increase progesterone levels"], correct_option="B"),
        LessonQuiz(lesson_id=l7.id, question="Why are NSAIDs effective for period pain in endometriosis?",
            options=["They suppress oestrogen", "They reduce prostaglandin production", "They dissolve endometrial lesions", "They block nerve signals permanently"], correct_option="B"),
        LessonQuiz(lesson_id=l7.id, question="What type of specialist can help with muscle tension and pelvic floor issues related to endometriosis?",
            options=["Neurologist", "Rheumatologist", "Pelvic floor physiotherapist", "Gastroenterologist"], correct_option="C"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m3.id, question="What is the Mirena IUS?",
            option_a="A type of oral contraceptive pill", option_b="A progestogen-releasing intrauterine system", option_c="A GnRH analogue injection", option_d="A surgical instrument", correct_option="B"),
        ModuleTest(module_id=m3.id, question="Do hormonal treatments cure endometriosis?",
            option_a="Yes, permanently", option_b="Yes, but only Stage I and II", option_c="No, symptoms often return after stopping", option_d="No, they only work for pain not lesions", correct_option="C"),
        ModuleTest(module_id=m3.id, question="When is it most effective to start taking NSAIDs for period pain?",
            option_a="During the heaviest day of bleeding", option_b="After the period ends", option_c="1–2 days before the period starts", option_d="Only when pain reaches a 9 or 10 out of 10", correct_option="C"),
        ModuleTest(module_id=m3.id, question="Which medication is specifically licensed for endometriosis in many countries?",
            option_a="Ibuprofen", option_b="Dienogest", option_c="Paracetamol", option_d="Gabapentin", correct_option="B"),
    ])
    database.session.commit()

    # --- Module 2.2 ---
    m4 = Module(title="Surgical Treatments", description="Laparoscopic surgery — what to expect and when it is considered.", course_id=c2.id, order_index=1)
    database.session.add(m4)
    database.session.commit()

    l8 = Lesson(title="Laparoscopy: Diagnosis and Excision", module_id=m4.id, content_type="text", order_index=0,
        text_content=(
            "Laparoscopy is the gold-standard procedure for both diagnosing and treating endometriosis.\n\n"
            "What is a laparoscopy?\n"
            "  A minimally invasive surgical procedure performed under general anaesthetic. "
            "A small camera (laparoscope) is inserted through a tiny incision near the navel to visualise the pelvic organs.\n\n"
            "Diagnostic laparoscopy:\n"
            "  Used to confirm the presence, location and stage of endometriosis. A biopsy may be taken for histological confirmation.\n\n"
            "Excision surgery:\n"
            "  The preferred surgical approach. Lesions are cut out (excised) at the root, which has better long-term outcomes than ablation. "
            "Best performed by a specialist endometriosis surgeon.\n\n"
            "Ablation (laser or diathermy):\n"
            "  Lesions are burned or destroyed. Faster to perform but associated with higher recurrence rates than excision.\n\n"
            "Recovery:\n"
            "  Most people return home the same day or after one night. Full recovery typically takes 1–4 weeks depending on the extent of surgery.\n\n"
            "Recurrence:\n"
            "  Endometriosis can return after surgery. Hormonal treatment post-operatively can reduce recurrence risk."
        ))
    l9 = Lesson(title="When to Consider Surgery", module_id=m4.id, content_type="text", order_index=1,
        text_content=(
            "Surgery is not the right choice for everyone. It is generally considered when:\n\n"
            "- Medical management has not adequately controlled symptoms\n"
            "- Endometriomas (ovarian cysts) are present and causing symptoms or affecting fertility\n"
            "- There is suspicion of deep infiltrating endometriosis (DIE) affecting the bowel or bladder\n"
            "- Fertility treatment is being planned and surgery may improve outcomes\n"
            "- Diagnosis has not been confirmed and is needed to guide treatment\n\n"
            "Risks of surgery:\n"
            "  All surgery carries risks including infection, bleeding, and damage to surrounding structures. "
            "Bowel and bladder injuries are rare but possible, especially with complex disease.\n\n"
            "Seeking specialist care:\n"
            "  For moderate to severe endometriosis, surgery should ideally be performed at a specialist endometriosis centre "
            "by a multidisciplinary team including a gynaecologist, colorectal surgeon, and urologist if needed.\n\n"
            "Hysterectomy:\n"
            "  Removal of the uterus does not cure endometriosis if lesions outside the uterus are not also removed. "
            "It is considered a last resort for those who have completed their family and have severe disease."
        ))
    database.session.add_all([l8, l9])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l8.id, question="What is the gold-standard approach for surgically treating endometriosis lesions?",
            options=["Ablation", "Hysterectomy", "Excision", "Cryotherapy"], correct_option="C"),
        LessonQuiz(lesson_id=l8.id, question="What is inserted through a small incision during a laparoscopy?",
            options=["A biopsy needle", "A laparoscope (small camera)", "A drainage tube", "A hormone implant"], correct_option="B"),
        LessonQuiz(lesson_id=l9.id, question="Does a hysterectomy cure endometriosis?",
            options=["Yes, always", "Only if ovaries are also removed", "No, not if lesions outside the uterus remain", "Yes, in Stage I and II only"], correct_option="C"),
        LessonQuiz(lesson_id=l9.id, question="What type of endometriosis cyst on the ovaries may require surgical intervention?",
            options=["Dermoid cyst", "Functional cyst", "Endometrioma", "Fibroadenoma"], correct_option="C"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m4.id, question="Which surgical technique has better long-term outcomes for endometriosis?",
            option_a="Ablation", option_b="Excision", option_c="Hysterectomy", option_d="Biopsy only", correct_option="B"),
        ModuleTest(module_id=m4.id, question="What does a laparoscopy involve?",
            option_a="Open abdominal surgery under general anaesthetic",
            option_b="A minimally invasive procedure using a camera inserted through small incisions",
            option_c="A vaginal examination under local anaesthetic",
            option_d="Robotic surgery requiring a 3-night hospital stay",
            correct_option="B"),
        ModuleTest(module_id=m4.id, question="Which type of specialist centre is recommended for complex endometriosis surgery?",
            option_a="A general GP surgery", option_b="Any hospital outpatient clinic", option_c="A specialist endometriosis centre", option_d="A fertility clinic only", correct_option="C"),
        ModuleTest(module_id=m4.id, question="Why might hormonal treatment be prescribed after surgery?",
            option_a="To prepare for a second operation", option_b="To reduce the risk of endometriosis recurring", option_c="To increase oestrogen levels post-operatively", option_d="It is always required by law after a laparoscopy", correct_option="B"),
    ])
    database.session.commit()

    # ============================================================== COURSE 3
    c3 = Course(
        title="Living Well with Endometriosis",
        description="Practical strategies for managing endometriosis day to day — covering nutrition, mental health, relationships, and self-advocacy.",
        created_by=admin.id,
    )
    database.session.add(c3)
    database.session.commit()

    # --- Module 3.1 ---
    m5 = Module(title="Nutrition and Lifestyle", description="How diet and lifestyle choices can influence endometriosis symptoms.", course_id=c3.id, order_index=0)
    database.session.add(m5)
    database.session.commit()

    l10 = Lesson(title="Anti-Inflammatory Diet", module_id=m5.id, content_type="text", order_index=0,
        text_content=(
            "While no diet cures endometriosis, an anti-inflammatory approach may help reduce symptom severity for some people.\n\n"
            "Foods that may help:\n"
            "- Omega-3 rich foods: oily fish (salmon, mackerel, sardines), flaxseeds, walnuts — anti-inflammatory properties\n"
            "- Fruits and vegetables: rich in antioxidants; dark leafy greens, berries, and cruciferous vegetables are particularly beneficial\n"
            "- Wholegrains: support gut health and stable blood sugar\n"
            "- Legumes: good fibre source, support hormonal balance\n"
            "- Turmeric and ginger: evidence of anti-inflammatory effects\n\n"
            "Foods some people choose to limit:\n"
            "- Red and processed meat: associated with higher oestrogen levels in some studies\n"
            "- Trans fats (processed foods, fast food): pro-inflammatory\n"
            "- Alcohol: can increase oestrogen levels\n"
            "- Caffeine: may worsen pelvic pain in some individuals\n\n"
            "Important: dietary changes should be made gradually and with guidance from a dietitian if possible. "
            "Restrictive diets can have their own risks. Evidence in this area is still emerging."
        ))
    l11 = Lesson(title="Exercise, Sleep and Stress", module_id=m5.id, content_type="text", order_index=1,
        text_content=(
            "Lifestyle factors can meaningfully impact endometriosis symptoms and overall wellbeing.\n\n"
            "Exercise:\n"
            "  Regular, gentle exercise can reduce oestrogen levels, improve mood, and reduce inflammation. "
            "Yoga, swimming, and walking are often well-tolerated. "
            "High-intensity exercise may worsen pain during flares — listen to your body and adapt accordingly.\n\n"
            "Sleep:\n"
            "  Chronic pain disrupts sleep, and poor sleep lowers pain tolerance — a difficult cycle. "
            "Good sleep hygiene (consistent sleep times, a dark cool room, limiting screens before bed) can help. "
            "If pain is preventing sleep, discuss this with your doctor.\n\n"
            "Stress:\n"
            "  Stress activates the inflammatory response, which can worsen endometriosis pain. "
            "Mindfulness, breathing exercises, and cognitive behavioural therapy (CBT) have evidence for reducing pain perception. "
            "Pacing — planning activities to avoid boom-and-bust cycles — is a useful strategy for managing energy.\n\n"
            "Heat therapy:\n"
            "  A heat pad or hot water bottle on the abdomen or lower back provides effective short-term pain relief for many people."
        ))
    database.session.add_all([l10, l11])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l10.id, question="Which type of food is associated with anti-inflammatory properties and may benefit endometriosis symptoms?",
            options=["Processed meat", "Omega-3 rich foods like oily fish", "Trans fats", "Refined sugar"], correct_option="B"),
        LessonQuiz(lesson_id=l10.id, question="Does diet cure endometriosis?",
            options=["Yes, a strict diet can eliminate lesions", "No, but it may help reduce symptom severity for some people", "Only if combined with surgery", "Yes, cutting out gluten cures it"], correct_option="B"),
        LessonQuiz(lesson_id=l11.id, question="Why does poor sleep make endometriosis harder to manage?",
            options=["It raises oestrogen levels", "It lowers pain tolerance, worsening the pain-sleep cycle", "It prevents hormonal treatments from working", "It causes new lesions to form"], correct_option="B"),
        LessonQuiz(lesson_id=l11.id, question="Which simple physical intervention provides effective short-term pain relief for many people with endometriosis?",
            options=["Cold therapy", "Heat therapy", "Compression bandaging", "Elevation of the legs"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m5.id, question="Which nutrient found in oily fish has anti-inflammatory properties?",
            option_a="Omega-6", option_b="Saturated fat", option_c="Omega-3", option_d="Vitamin D", correct_option="C"),
        ModuleTest(module_id=m5.id, question="What type of exercise is generally well-tolerated during endometriosis flares?",
            option_a="High-intensity interval training", option_b="Heavy weightlifting", option_c="Competitive sport", option_d="Gentle yoga or swimming", correct_option="D"),
        ModuleTest(module_id=m5.id, question="Which approach is recommended for managing energy levels to avoid exhaustion cycles?",
            option_a="Resting completely for weeks at a time", option_b="Pacing activities to balance rest and exertion", option_c="Pushing through pain to maintain fitness", option_d="Eliminating all exercise", correct_option="B"),
        ModuleTest(module_id=m5.id, question="What effect can alcohol have that is relevant to endometriosis?",
            option_a="It reduces pelvic inflammation", option_b="It can increase oestrogen levels", option_c="It has no effect on hormones", option_d="It improves sleep quality", correct_option="B"),
    ])
    database.session.commit()

    # --- Module 3.2 ---
    m6 = Module(title="Mental Health and Self-Advocacy", description="Looking after your mental health and navigating the healthcare system with confidence.", course_id=c3.id, order_index=1)
    database.session.add(m6)
    database.session.commit()

    l12 = Lesson(title="The Mental Health Impact of Endometriosis", module_id=m6.id, content_type="text", order_index=0,
        text_content=(
            "Endometriosis has a significant and often underacknowledged impact on mental health.\n\n"
            "Research shows that people with endometriosis are significantly more likely to experience:\n"
            "- Depression and anxiety\n"
            "- Feelings of isolation and not being believed\n"
            "- Grief over lost time, fertility concerns, and life disruption\n"
            "- Impact on identity and self-worth\n\n"
            "The pain-mood connection:\n"
            "  Chronic pain changes brain chemistry and increases stress hormones. Pain and low mood form a feedback loop — each makes the other worse.\n\n"
            "What helps:\n"
            "- Talking therapy (CBT, acceptance and commitment therapy) has strong evidence for chronic pain conditions\n"
            "- Peer support and community — connecting with others who understand can reduce isolation\n"
            "- Acknowledging grief — it is valid to grieve the life endometriosis has affected\n"
            "- Communicating needs to partners, family and employers\n\n"
            "When to seek help:\n"
            "  If low mood, anxiety, or hopelessness is affecting daily life, speak to your GP. "
            "Mental health support should be considered an integral part of endometriosis care, not a last resort."
        ))
    l13 = Lesson(title="Advocating for Yourself in Healthcare", module_id=m6.id, content_type="text", order_index=1,
        text_content=(
            "Navigating the healthcare system with endometriosis can be exhausting and frustrating. Self-advocacy is a vital skill.\n\n"
            "Keep a symptom diary:\n"
            "  Record pain levels, triggers, symptom types, and impact on daily life. Specific, documented evidence is more compelling than memory alone.\n\n"
            "Know your rights:\n"
            "  You have the right to ask for a second opinion, request a referral to a specialist, and have your pain taken seriously.\n\n"
            "Prepare for appointments:\n"
            "  Write down your top 3 concerns before each appointment. Be specific: 'My pain is 8/10 on day 1 and prevents me from working' is more impactful than 'I have bad periods'.\n\n"
            "Ask about specialist centres:\n"
            "  For complex or unresolved cases, ask your GP or gynaecologist for a referral to a BSGE-accredited endometriosis centre (in the UK) or equivalent specialist service.\n\n"
            "Bring support:\n"
            "  A trusted person can help you remember information, take notes, and advocate on your behalf.\n\n"
            "If you are dismissed:\n"
            "  You can change your GP. Patient organisations like Endometriosis UK provide helplines, resources, and support networks."
        ))
    database.session.add_all([l12, l13])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l12.id, question="Which mental health conditions are more common in people with endometriosis?",
            options=["Schizophrenia and bipolar disorder", "Depression and anxiety", "OCD and PTSD only", "Eating disorders only"], correct_option="B"),
        LessonQuiz(lesson_id=l12.id, question="Which type of therapy has strong evidence for managing pain in chronic conditions?",
            options=["Psychoanalysis", "Hypnotherapy only", "Cognitive behavioural therapy (CBT)", "Electroconvulsive therapy"], correct_option="C"),
        LessonQuiz(lesson_id=l13.id, question="What is one of the most useful tools for communicating symptoms effectively to a doctor?",
            options=["A detailed symptom diary", "A list of medications you want prescribed", "An online forum printout", "A letter from a friend"], correct_option="A"),
        LessonQuiz(lesson_id=l13.id, question="In the UK, which accreditation indicates a specialist endometriosis surgical centre?",
            options=["NHS Direct", "CQC registered", "BSGE-accredited", "NICE-approved"], correct_option="C"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m6.id, question="Why is chronic pain associated with low mood?",
            option_a="Pain has no effect on mental health", option_b="Pain changes brain chemistry and increases stress hormones", option_c="Low mood is a side effect of all pain medications", option_d="Pain only affects mental health in severe cases", correct_option="B"),
        ModuleTest(module_id=m6.id, question="What should you do if you feel dismissed by your GP about endometriosis symptoms?",
            option_a="Stop seeking medical help", option_b="Only rely on online advice", option_c="Accept that your pain is normal", option_d="Know that you have the right to seek a second opinion or change GP", correct_option="D"),
        ModuleTest(module_id=m6.id, question="When preparing for a medical appointment, what is more effective to say?",
            option_a="'I have bad periods'", option_b="'My pain is 8/10 on day 1 and prevents me from working'", option_c="'I think I have endometriosis'", option_d="'Other people have told me I have this condition'", correct_option="B"),
        ModuleTest(module_id=m6.id, question="Which organisation provides endometriosis support and helplines in the UK?",
            option_a="British Heart Foundation", option_b="Cancer Research UK", option_c="Endometriosis UK", option_d="Macmillan Cancer Support", correct_option="C"),
    ])
    database.session.commit()

    # ============================================================== COURSE 4
    c4 = Course(
        title="Nutrition and Endometriosis",
        description="A deep dive into how food choices, gut health, and key nutrients interact with endometriosis — with practical guidance for building a sustainable, symptom-supportive diet.",
        created_by=admin.id,
    )
    database.session.add(c4)
    database.session.commit()

    # --- Module 4.1 ---
    m7 = Module(title="Food and Inflammation", description="How diet influences the inflammatory processes underlying endometriosis.", course_id=c4.id, order_index=0)
    database.session.add(m7)
    database.session.commit()

    l14 = Lesson(title="How Inflammation Works in Endometriosis", module_id=m7.id, content_type="text", order_index=0,
        text_content=(
            "Inflammation is a central driver of pain and disease progression in endometriosis.\n\n"
            "What happens:\n"
            "  Endometriosis lesions trigger a chronic low-grade inflammatory response in the pelvic cavity. "
            "The immune system sends inflammatory molecules (cytokines and prostaglandins) to the site, causing pain, swelling, and scar tissue formation.\n\n"
            "How diet connects:\n"
            "  Certain foods promote pro-inflammatory signalling, while others reduce it. "
            "The balance of omega-6 to omega-3 fatty acids in your diet is particularly influential — the typical Western diet is heavily skewed towards omega-6, which is pro-inflammatory.\n\n"
            "Key inflammatory drivers in diet:\n"
            "- Trans fats (hydrogenated oils in processed food)\n"
            "- High refined sugar intake\n"
            "- Excess red and processed meat\n"
            "- Alcohol\n\n"
            "Key anti-inflammatory foods:\n"
            "- Oily fish (salmon, sardines, mackerel) — rich in omega-3\n"
            "- Berries and dark leafy greens — rich in antioxidants\n"
            "- Extra virgin olive oil — contains oleocanthal, a natural anti-inflammatory\n"
            "- Turmeric (with black pepper) — curcumin has documented anti-inflammatory properties"
        ))
    l15 = Lesson(title="The Role of Oestrogen and Phytoestrogens", module_id=m7.id, content_type="text", order_index=1,
        text_content=(
            "Endometriosis is an oestrogen-dependent condition — high oestrogen levels fuel lesion growth. Diet can influence oestrogen metabolism.\n\n"
            "How the body processes oestrogen:\n"
            "  Oestrogen is metabolised in the liver and excreted via the gut. A healthy gut microbiome supports this process.\n\n"
            "Fibre and oestrogen:\n"
            "  Dietary fibre binds to oestrogen in the digestive tract and helps remove it from the body. "
            "Low-fibre diets are associated with higher circulating oestrogen levels. Aim for 25–30g of fibre per day from wholegrains, legumes, vegetables and fruit.\n\n"
            "Phytoestrogens:\n"
            "  Plant compounds (found in soy, flaxseeds, chickpeas) that weakly mimic oestrogen. "
            "The research on phytoestrogens and endometriosis is mixed — some studies suggest they are beneficial as they may block stronger oestrogen receptors; others urge caution. "
            "Moderate intake of whole food sources (e.g., edamame, tofu) is generally considered safe.\n\n"
            "Alcohol and oestrogen:\n"
            "  Alcohol impairs oestrogen metabolism in the liver and is associated with higher oestrogen levels. "
            "Reducing alcohol intake is one of the most evidence-backed dietary changes for hormonal balance."
        ))
    l16 = Lesson(title="Gut Health and the Endo-Gut Connection", module_id=m7.id, content_type="text", order_index=2,
        text_content=(
            "Many people with endometriosis experience gut symptoms such as bloating, constipation, diarrhoea, and nausea — particularly around menstruation.\n\n"
            "Why the gut is involved:\n"
            "- Endometriosis lesions can occur on the bowel directly\n"
            "- Inflammation and prostaglandins affect gut motility\n"
            "- The gut microbiome influences oestrogen metabolism (the 'estrobolome')\n"
            "- Endometriosis and IBS frequently co-occur\n\n"
            "Supporting gut health:\n"
            "- Probiotics: fermented foods (yoghurt, kefir, sauerkraut, kimchi) and probiotic supplements may support a healthy microbiome\n"
            "- Prebiotics: foods that feed beneficial gut bacteria — garlic, onions, leeks, bananas, oats\n"
            "- Fibre: aim for a variety of plant-based fibre sources\n"
            "- Hydration: adequate water intake supports bowel regularity\n\n"
            "Low-FODMAP diet:\n"
            "  For those with significant IBS-type symptoms, a low-FODMAP diet (reducing fermentable carbohydrates) may reduce bloating and pain. "
            "This should be done with guidance from a registered dietitian as it is highly restrictive."
        ))
    database.session.add_all([l14, l15, l16])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l14.id, question="Which molecules drive inflammation and pain in endometriosis lesions?",
            options=["Insulin and glucagon", "Cytokines and prostaglandins", "Serotonin and dopamine", "Oestrogen and progesterone"], correct_option="B"),
        LessonQuiz(lesson_id=l14.id, question="Which oil contains oleocanthal, a natural anti-inflammatory compound?",
            options=["Vegetable oil", "Sunflower oil", "Extra virgin olive oil", "Coconut oil"], correct_option="C"),
        LessonQuiz(lesson_id=l15.id, question="How does dietary fibre help with oestrogen levels?",
            options=["It boosts oestrogen production", "It binds to oestrogen in the gut and helps remove it", "It converts oestrogen into progesterone", "It has no effect on oestrogen"], correct_option="B"),
        LessonQuiz(lesson_id=l15.id, question="What is a phytoestrogen?",
            options=["A synthetic hormone used in HRT", "A plant compound that weakly mimics oestrogen", "A type of dietary supplement for menopause", "A pro-inflammatory fatty acid"], correct_option="B"),
        LessonQuiz(lesson_id=l16.id, question="What is the 'estrobolome'?",
            options=["A type of ovarian cyst", "The gut microbiome's role in oestrogen metabolism", "A hormone produced in the bowel", "A low-FODMAP food group"], correct_option="B"),
        LessonQuiz(lesson_id=l16.id, question="Which diet may help reduce IBS-type symptoms in endometriosis?",
            options=["Ketogenic diet", "Low-FODMAP diet", "Carnivore diet", "Raw food diet"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m7.id, question="Which fatty acid ratio is most relevant to inflammation in the diet?",
            option_a="Omega-3 to omega-9", option_b="Saturated to unsaturated fat", option_c="Omega-6 to omega-3", option_d="Trans fat to monounsaturated fat", correct_option="C"),
        ModuleTest(module_id=m7.id, question="Which food group is one of the best dietary sources of omega-3?",
            option_a="Red meat", option_b="Oily fish", option_c="White bread", option_d="Dairy products", correct_option="B"),
        ModuleTest(module_id=m7.id, question="How much fibre per day is generally recommended?",
            option_a="5–10g", option_b="10–15g", option_c="15–20g", option_d="25–30g", correct_option="D"),
        ModuleTest(module_id=m7.id, question="What dietary change is most evidence-backed for supporting hormonal balance?",
            option_a="Cutting out all carbohydrates", option_b="Reducing alcohol intake", option_c="Going vegetarian", option_d="Eliminating all dairy", correct_option="B"),
    ])
    database.session.commit()

    # --- Module 4.2 ---
    m8 = Module(title="Key Nutrients and Meal Planning", description="Specific vitamins, minerals and practical advice for building an endometriosis-supportive diet.", course_id=c4.id, order_index=1)
    database.session.add(m8)
    database.session.commit()

    l17 = Lesson(title="Vitamins and Minerals That Matter", module_id=m8.id, content_type="text", order_index=0,
        text_content=(
            "Certain micronutrients play a particularly important role in managing endometriosis symptoms.\n\n"
            "Magnesium:\n"
            "  Involved in muscle relaxation and nerve function. Deficiency is common and associated with worsened period pain. "
            "Found in dark chocolate, nuts, seeds, leafy greens, and wholegrains. "
            "A supplement of 300–400mg/day is often recommended for dysmenorrhoea.\n\n"
            "Vitamin D:\n"
            "  Has immune-modulating and anti-inflammatory effects. Low vitamin D is frequently found in people with endometriosis. "
            "Sun exposure is the main source; supplementation (1000–2000 IU/day) is often needed in the UK, especially in winter.\n\n"
            "Zinc:\n"
            "  Supports immune function and has anti-inflammatory properties. Found in pumpkin seeds, legumes, shellfish, and wholegrains.\n\n"
            "Iron:\n"
            "  Heavy periods increase the risk of iron-deficiency anaemia. Good sources: red meat (in moderation), lentils, spinach, fortified cereals. "
            "Pair plant-based iron with vitamin C to improve absorption.\n\n"
            "Vitamin B6:\n"
            "  Involved in progesterone production and may help with PMS and hormonal balance. Found in chicken, fish, potatoes, and bananas."
        ))
    l18 = Lesson(title="Building a Symptom-Supportive Meal Plan", module_id=m8.id, content_type="text", order_index=1,
        text_content=(
            "A sustainable approach to eating with endometriosis is not about strict rules — it is about consistency and balance.\n\n"
            "General principles:\n"
            "- Eat plenty of colourful vegetables (aim for 5–7 portions daily)\n"
            "- Include oily fish 2–3 times per week\n"
            "- Choose wholegrains over refined carbohydrates\n"
            "- Include legumes (lentils, chickpeas, beans) several times a week\n"
            "- Use olive oil as your main cooking fat\n"
            "- Stay well hydrated (1.5–2 litres of water per day)\n\n"
            "Around your period:\n"
            "- Increase magnesium-rich foods in the week before your period\n"
            "- Start NSAIDs 1–2 days before expected onset if prescribed\n"
            "- Reduce alcohol and caffeine in the week before menstruation\n"
            "- Keep easily prepared, nourishing meals on hand for high-pain days\n\n"
            "Practical tips:\n"
            "- Batch cook soups, stews, and grain bowls when you have energy\n"
            "- Keep frozen vegetables, tinned fish, and canned legumes as convenient staples\n"
            "- Small, regular meals may reduce bloating compared to large infrequent ones\n\n"
            "Remember: no single diet works for everyone. Keep a food and symptom diary to identify your personal triggers."
        ))
    database.session.add_all([l17, l18])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l17.id, question="Which mineral is associated with muscle relaxation and is often deficient in people with period pain?",
            options=["Calcium", "Magnesium", "Potassium", "Sodium"], correct_option="B"),
        LessonQuiz(lesson_id=l17.id, question="What should you pair with plant-based iron sources to improve absorption?",
            options=["Dairy products", "Vitamin C", "Vitamin B12", "Calcium"], correct_option="B"),
        LessonQuiz(lesson_id=l18.id, question="How many portions of vegetables should you aim for daily?",
            options=["1–2", "3–4", "5–7", "8–10"], correct_option="C"),
        LessonQuiz(lesson_id=l18.id, question="What is a practical strategy for managing nutrition on high-pain days?",
            options=["Skip meals to reduce bloating", "Order takeaways only", "Have batch-cooked meals prepared in advance", "Eat only raw foods"], correct_option="C"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m8.id, question="Which vitamin has immune-modulating effects and is frequently low in people with endometriosis?",
            option_a="Vitamin A", option_b="Vitamin C", option_c="Vitamin D", option_d="Vitamin E", correct_option="C"),
        ModuleTest(module_id=m8.id, question="How many times per week is oily fish recommended?",
            option_a="Once a month", option_b="Once a week", option_c="2–3 times per week", option_d="Every day", correct_option="C"),
        ModuleTest(module_id=m8.id, question="Which mineral found in pumpkin seeds supports immune function and has anti-inflammatory properties?",
            option_a="Iron", option_b="Zinc", option_c="Magnesium", option_d="Selenium", correct_option="B"),
        ModuleTest(module_id=m8.id, question="What is the most reliable way to find your personal dietary triggers?",
            option_a="Follow the strictest elimination diet available",
            option_b="Avoid all foods that are mentioned online",
            option_c="Keep a food and symptom diary",
            option_d="Copy the diet of someone else with endometriosis",
            correct_option="C"),
    ])
    database.session.commit()

    # ============================================================== COURSE 5
    c5 = Course(
        title="Endometriosis and Fertility",
        description="Understanding how endometriosis affects fertility, what treatments can help, and how to navigate the emotional journey of trying to conceive.",
        created_by=admin.id,
    )
    database.session.add(c5)
    database.session.commit()

    m9 = Module(title="How Endometriosis Affects Fertility", description="The mechanisms behind endometriosis-related infertility.", course_id=c5.id, order_index=0)
    database.session.add(m9)
    database.session.commit()

    l19 = Lesson(title="Endometriosis and Conception", module_id=m9.id, content_type="text", order_index=0,
        text_content=(
            "Endometriosis is one of the leading causes of infertility, affecting 30–50% of people who struggle to conceive.\n\n"
            "How it impacts fertility:\n"
            "- Adhesions and scarring can block or distort the fallopian tubes, preventing the egg and sperm from meeting\n"
            "- Endometriomas (ovarian cysts) can damage the surrounding ovarian tissue and reduce egg reserve\n"
            "- Inflammation in the pelvic environment may impair egg quality, sperm function, and embryo implantation\n"
            "- Hormonal imbalances associated with endometriosis can disrupt ovulation\n\n"
            "Important to know:\n"
            "  Having endometriosis does not mean you cannot conceive. Many people with endometriosis conceive naturally. "
            "The impact on fertility depends on the location, extent, and stage of the disease.\n\n"
            "Ovarian reserve:\n"
            "  AMH (anti-Müllerian hormone) blood tests and antral follicle counts via ultrasound can assess egg reserve. "
            "These are worth discussing with a fertility specialist if you have endometriomas or have had repeated ovarian surgery."
        ))
    l20 = Lesson(title="Fertility Treatment Options", module_id=m9.id, content_type="text", order_index=1,
        text_content=(
            "Several fertility treatments are available for people with endometriosis.\n\n"
            "IUI (Intrauterine Insemination):\n"
            "  Sperm is placed directly into the uterus around the time of ovulation. May be suitable for mild endometriosis.\n\n"
            "IVF (In Vitro Fertilisation):\n"
            "  Eggs are retrieved, fertilised in a lab, and embryos transferred to the uterus. Often the recommended route for moderate-to-severe endometriosis. "
            "Success rates vary by age and ovarian reserve.\n\n"
            "Surgery before IVF:\n"
            "  Whether to operate on endometriomas before IVF is debated. Surgery may improve access to follicles but risks reducing ovarian reserve. "
            "This decision should be made with a specialist multidisciplinary team.\n\n"
            "Egg freezing:\n"
            "  For those not yet ready to conceive but concerned about declining ovarian reserve, egg freezing is an option worth discussing early.\n\n"
            "Emotional support:\n"
            "  Fertility treatment is emotionally demanding. Counselling, peer support groups, and open communication with your partner are all important."
        ))
    database.session.add_all([l19, l20])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l19.id, question="What percentage of people experiencing infertility are found to have endometriosis?",
            options=["5–10%", "10–20%", "30–50%", "60–70%"], correct_option="C"),
        LessonQuiz(lesson_id=l19.id, question="Which blood test can help assess egg reserve?",
            options=["FSH only", "AMH (anti-Müllerian hormone)", "Oestrogen levels", "Progesterone test"], correct_option="B"),
        LessonQuiz(lesson_id=l20.id, question="What does IVF involve?",
            options=["Placing sperm into the uterus", "Eggs fertilised in a lab and embryos transferred to the uterus", "Hormonal suppression only", "Surgical removal of lesions"], correct_option="B"),
        LessonQuiz(lesson_id=l20.id, question="What is one option for someone concerned about future fertility but not yet ready to conceive?",
            options=["Immediate IVF", "Egg freezing", "Hysterectomy", "GnRH analogues permanently"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m9.id, question="How does endometriosis most directly block conception?",
            option_a="By preventing ovulation entirely in all cases",
            option_b="Through adhesions blocking fallopian tubes and inflammation impairing implantation",
            option_c="By raising progesterone levels",
            option_d="By causing the uterus to shrink",
            correct_option="B"),
        ModuleTest(module_id=m9.id, question="Does endometriosis always cause infertility?",
            option_a="Yes, always", option_b="Only in Stage IV", option_c="No, many people with endometriosis conceive naturally", option_d="Only if untreated for 10+ years", correct_option="C"),
        ModuleTest(module_id=m9.id, question="What is an endometrioma?",
            option_a="A uterine fibroid", option_b="An endometriosis cyst on the ovary", option_c="A type of IVF procedure", option_d="A hormone used in fertility treatment", correct_option="B"),
        ModuleTest(module_id=m9.id, question="Which fertility treatment is typically recommended for moderate-to-severe endometriosis?",
            option_a="IUI", option_b="Natural cycle monitoring only", option_c="IVF", option_d="Hormone injections only", correct_option="C"),
    ])
    database.session.commit()

    # ============================================================== COURSE 6
    c6 = Course(
        title="Endometriosis and Mental Health",
        description="A dedicated course exploring the psychological impact of endometriosis and evidence-based strategies for protecting your mental wellbeing.",
        created_by=admin.id,
    )
    database.session.add(c6)
    database.session.commit()

    m10 = Module(title="Chronic Pain and Psychological Wellbeing", description="Understanding the link between chronic pain and mental health.", course_id=c6.id, order_index=0)
    database.session.add(m10)
    database.session.commit()

    l21 = Lesson(title="Living with Chronic Pain", module_id=m10.id, content_type="text", order_index=0,
        text_content=(
            "Chronic pain — pain lasting more than three months — has a profound effect on mental health, identity, and daily functioning.\n\n"
            "The pain-brain connection:\n"
            "  Persistent pain causes changes in the nervous system known as central sensitisation. "
            "The brain becomes more attuned to pain signals, meaning even mild stimuli can be perceived as painful. "
            "This is not 'imagined' pain — it is a measurable neurological change.\n\n"
            "Emotional consequences of chronic pain:\n"
            "- Grief and loss: grieving the version of yourself before illness, lost opportunities, and uncertain future plans\n"
            "- Anxiety: fear of the next flare, medical appointments, and uncertainty about the future\n"
            "- Depression: low mood, hopelessness, and loss of pleasure in activities\n"
            "- Anger: at the condition, at delays in diagnosis, at a system that dismissed your symptoms\n\n"
            "All of these responses are valid and normal. Acknowledging them is the first step.\n\n"
            "You are not your illness:\n"
            "  Endometriosis is something you have, not something you are. Maintaining identity outside of illness — through relationships, creativity, community — is protective."
        ))
    l22 = Lesson(title="Therapies and Coping Strategies", module_id=m10.id, content_type="text", order_index=1,
        text_content=(
            "Evidence-based psychological approaches can significantly improve quality of life for people with endometriosis.\n\n"
            "Cognitive Behavioural Therapy (CBT):\n"
            "  Helps identify and change unhelpful thought patterns around pain. Has strong evidence for chronic pain conditions. "
            "Can be accessed via your GP referral, private therapy, or online programmes.\n\n"
            "Acceptance and Commitment Therapy (ACT):\n"
            "  Focuses on accepting pain rather than fighting it, and committing to actions aligned with your values despite pain. "
            "Particularly effective for chronic pain and illness.\n\n"
            "Mindfulness-based stress reduction (MBSR):\n"
            "  8-week programme combining meditation and body awareness. Shown to reduce pain intensity and improve mood.\n\n"
            "Pacing:\n"
            "  Breaking activities into manageable chunks and resting before you reach your limit. Avoids boom-and-bust cycles that worsen fatigue and pain.\n\n"
            "Peer support:\n"
            "  Connecting with others who understand lived experience reduces isolation and provides practical advice. "
            "Endometriosis UK runs support groups and a helpline."
        ))
    database.session.add_all([l21, l22])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l21.id, question="What is central sensitisation?",
            options=["A type of endometriosis lesion", "A neurological change making the brain more sensitive to pain signals", "A hormonal imbalance", "A side effect of hormonal treatment"], correct_option="B"),
        LessonQuiz(lesson_id=l21.id, question="Which emotional response to chronic illness is described as normal and valid?",
            options=["None — emotions should be suppressed", "Only anxiety", "Grief, anxiety, depression and anger", "Only depression"], correct_option="C"),
        LessonQuiz(lesson_id=l22.id, question="What does ACT (Acceptance and Commitment Therapy) focus on?",
            options=["Eliminating all negative thoughts", "Accepting pain and committing to values-based actions despite it", "Medication management only", "Surgical preparation"], correct_option="B"),
        LessonQuiz(lesson_id=l22.id, question="What is 'pacing' in the context of chronic pain management?",
            options=["Running at a steady speed", "Breaking activities into chunks and resting before reaching your limit", "Timing medication doses", "Tracking pain on a scale"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m10.id, question="How long must pain last to be considered 'chronic'?",
            option_a="More than one week", option_b="More than one month", option_c="More than three months", option_d="More than one year", correct_option="C"),
        ModuleTest(module_id=m10.id, question="Which therapy has the strongest evidence base for chronic pain?",
            option_a="Psychoanalysis", option_b="CBT (Cognitive Behavioural Therapy)", option_c="Hypnotherapy", option_d="Art therapy", correct_option="B"),
        ModuleTest(module_id=m10.id, question="What does MBSR stand for?",
            option_a="Medical Body Stress Response", option_b="Mindfulness-Based Stress Reduction", option_c="Managed Breathing and Stretching Routine", option_d="Mental and Behavioural Support Review", correct_option="B"),
        ModuleTest(module_id=m10.id, question="Which organisation runs endometriosis support groups and a helpline in the UK?",
            option_a="Mind UK", option_b="NHS Direct", option_c="Endometriosis UK", option_d="BUPA", correct_option="C"),
    ])
    database.session.commit()

    # ============================================================== COURSE 7
    c7 = Course(
        title="Bowel and Bladder Endometriosis",
        description="An in-depth look at endometriosis affecting the bowel and bladder — symptoms, diagnosis challenges, and treatment pathways.",
        created_by=admin.id,
    )
    database.session.add(c7)
    database.session.commit()

    m11 = Module(title="Deep Infiltrating Endometriosis", description="What DIE is and how it affects the bowel and bladder.", course_id=c7.id, order_index=0)
    database.session.add(m11)
    database.session.commit()

    l23 = Lesson(title="What is Deep Infiltrating Endometriosis?", module_id=m11.id, content_type="text", order_index=0,
        text_content=(
            "Deep infiltrating endometriosis (DIE) is a severe form of endometriosis where lesions penetrate more than 5mm beneath the surface of the peritoneum.\n\n"
            "Common sites of DIE:\n"
            "- Uterosacral ligaments (most common)\n"
            "- Recto-vaginal septum (between the rectum and vagina)\n"
            "- Bowel (rectum and sigmoid colon most frequently)\n"
            "- Bladder and ureters\n"
            "- Diaphragm (rare)\n\n"
            "Why it matters:\n"
            "  DIE is associated with the most severe pain symptoms and the greatest risk of organ damage if untreated. "
            "It requires specialist assessment and, when surgery is needed, should be performed by a multidisciplinary team.\n\n"
            "Diagnosis:\n"
            "  Transvaginal ultrasound (TVUS) by a specialist sonographer and MRI are the best non-surgical tools for mapping DIE. "
            "Standard ultrasound by a non-specialist is likely to miss it. "
            "A definitive diagnosis still requires laparoscopy."
        ))
    l24 = Lesson(title="Bowel and Bladder Symptoms", module_id=m11.id, content_type="text", order_index=1,
        text_content=(
            "Bowel and bladder symptoms are among the most disruptive and least discussed aspects of endometriosis.\n\n"
            "Bowel symptoms:\n"
            "- Painful bowel movements (dyschezia), especially during menstruation\n"
            "- Bloating — sometimes called 'endo belly', can be severe\n"
            "- Alternating constipation and diarrhoea\n"
            "- Rectal bleeding during periods (indicates bowel involvement)\n"
            "- Nausea and vomiting\n\n"
            "Bladder symptoms:\n"
            "- Painful urination (dysuria), especially around menstruation\n"
            "- Urinary frequency and urgency\n"
            "- Blood in the urine during periods (haematuria)\n"
            "- Recurrent UTI-like symptoms with no infection found on testing\n\n"
            "Why these are often missed:\n"
            "  Bowel symptoms are frequently attributed to IBS and bladder symptoms to recurrent UTIs. "
            "If symptoms are cyclical (worse around menstruation), endometriosis should be considered.\n\n"
            "Seek specialist review if:\n"
            "  You have rectal bleeding, blood in urine, or cyclical bowel/bladder symptoms alongside other endometriosis symptoms."
        ))
    database.session.add_all([l23, l24])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l23.id, question="How deep must lesions penetrate to be classified as deep infiltrating endometriosis?",
            options=["More than 1mm", "More than 3mm", "More than 5mm", "More than 10mm"], correct_option="C"),
        LessonQuiz(lesson_id=l23.id, question="Which imaging method is best for mapping DIE before surgery?",
            options=["Standard ultrasound", "X-ray", "Specialist transvaginal ultrasound or MRI", "CT scan alone"], correct_option="C"),
        LessonQuiz(lesson_id=l24.id, question="What is 'endo belly'?",
            options=["A type of ovarian cyst", "Severe bloating associated with endometriosis", "A surgical scar", "A diagnostic test"], correct_option="B"),
        LessonQuiz(lesson_id=l24.id, question="Which symptom pattern should raise suspicion of bowel or bladder endometriosis?",
            options=["Symptoms present every day regardless of cycle", "Symptoms that are cyclical and worsen around menstruation", "Symptoms only during ovulation", "Symptoms only in the morning"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m11.id, question="What does DIE stand for?",
            option_a="Diagnosed Internal Endometriosis", option_b="Deep Infiltrating Endometriosis", option_c="Diffuse Intestinal Endometriosis", option_d="Deep Implant Endometrioma", correct_option="B"),
        ModuleTest(module_id=m11.id, question="Which symptom specifically suggests bowel involvement?",
            option_a="Painful periods", option_b="Pain during sex", option_c="Rectal bleeding during periods", option_d="Fatigue", correct_option="C"),
        ModuleTest(module_id=m11.id, question="Why are bowel symptoms of endometriosis frequently missed?",
            option_a="They are always mild", option_b="They are often attributed to IBS", option_c="GPs are trained to recognise them", option_d="They only occur post-surgery", correct_option="B"),
        ModuleTest(module_id=m11.id, question="What type of team is needed for complex DIE surgery?",
            option_a="A single gynaecologist", option_b="A GP and practice nurse", option_c="A multidisciplinary team including colorectal and urological surgeons", option_d="An orthopaedic team", correct_option="C"),
    ])
    database.session.commit()

    # ============================================================== COURSE 8
    c8 = Course(
        title="Endometriosis in the Workplace and Education",
        description="Practical guidance on managing endometriosis at work and in education — including your rights, reasonable adjustments, and communication strategies.",
        created_by=admin.id,
    )
    database.session.add(c8)
    database.session.commit()

    m12 = Module(title="Your Rights and Adjustments", description="Legal protections and practical workplace adjustments for people with endometriosis.", course_id=c8.id, order_index=0)
    database.session.add(m12)
    database.session.commit()

    l25 = Lesson(title="Endometriosis and the Law", module_id=m12.id, content_type="text", order_index=0,
        text_content=(
            "In many countries, endometriosis may qualify as a disability under employment law, giving you important protections.\n\n"
            "UK — Equality Act 2010:\n"
            "  If endometriosis has a substantial and long-term adverse effect on your ability to carry out normal day-to-day activities, "
            "it may meet the legal definition of a disability. This means your employer must make reasonable adjustments.\n\n"
            "What are reasonable adjustments?\n"
            "- Flexible working hours (e.g. later start on painful days)\n"
            "- Permission to work from home\n"
            "- Access to a nearby toilet\n"
            "- Rest breaks\n"
            "- Adjusted absence management policies (endometriosis-related absences recorded separately)\n"
            "- A quiet or warm workspace\n\n"
            "You do not have to disclose your diagnosis to access adjustments, but disclosing to HR or occupational health can trigger formal support.\n\n"
            "Education:\n"
            "  Students can request adjustments such as deadline extensions, exam concessions, and access to medical leave. "
            "Speak to your university or school's disability or wellbeing services."
        ))
    l26 = Lesson(title="Managing Endometriosis Day-to-Day at Work", module_id=m12.id, content_type="text", order_index=1,
        text_content=(
            "Managing symptoms while maintaining a career is one of the biggest challenges of living with endometriosis.\n\n"
            "Planning around your cycle:\n"
            "  If your symptoms are predictable, plan lighter workloads or important meetings around your most symptomatic days. "
            "Period tracking apps can help identify patterns.\n\n"
            "Pain management at work:\n"
            "- Keep medication (NSAIDs, heat patches) accessible at your desk\n"
            "- A discreet heat pad can be used under clothing\n"
            "- Ergonomic seating or a standing desk can reduce pelvic pressure\n\n"
            "Communication:\n"
            "  You choose what to share and with whom. A general mention of a 'chronic health condition' is sufficient for many workplace conversations. "
            "Some find that disclosing to a trusted manager leads to greater flexibility and support.\n\n"
            "Absence and flares:\n"
            "  Keep records of endometriosis-related absences separately. Ask HR to note these under a chronic condition rather than standard sick leave, "
            "where possible, to avoid triggering absence management procedures.\n\n"
            "Career impact:\n"
            "  Endometriosis costs the UK economy an estimated £8.2 billion per year in lost productivity and healthcare. "
            "You are not alone — and accommodations are your right, not a favour."
        ))
    database.session.add_all([l25, l26])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l25.id, question="Which UK law may protect people with endometriosis in the workplace?",
            options=["Employment Rights Act 1996", "Equality Act 2010", "Health and Safety at Work Act 1974", "Human Rights Act 1998"], correct_option="B"),
        LessonQuiz(lesson_id=l25.id, question="Which of these is an example of a reasonable workplace adjustment?",
            options=["Replacing your role entirely", "Flexible working hours on painful days", "Unpaid leave only", "Moving to a different department permanently"], correct_option="B"),
        LessonQuiz(lesson_id=l26.id, question="What is a discreet way to manage pain at a desk job?",
            options=["Leaving work without notice", "Using a heat patch under clothing", "Requesting surgery leave monthly", "Asking colleagues to cover all your tasks"], correct_option="B"),
        LessonQuiz(lesson_id=l26.id, question="Why is it useful to record endometriosis-related absences separately?",
            options=["To claim more sick pay", "To avoid triggering standard absence management procedures", "It is a legal requirement", "To share with colleagues"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m12.id, question="Under the Equality Act 2010, what must an employer provide for a qualifying disability?",
            option_a="Full paid sick leave indefinitely", option_b="Reasonable adjustments", option_c="A dedicated medical room", option_d="A reduction in working hours with full pay", correct_option="B"),
        ModuleTest(module_id=m12.id, question="Do you have to disclose your endometriosis diagnosis to request adjustments?",
            option_a="Yes, always", option_b="Only if you are a manager", option_c="No, but disclosing to HR can trigger formal support", option_d="Only after two years of employment", correct_option="C"),
        ModuleTest(module_id=m12.id, question="Where can students request disability adjustments?",
            option_a="The admissions office", option_b="The university or school disability or wellbeing services", option_c="The student union only", option_d="The NHS", correct_option="B"),
        ModuleTest(module_id=m12.id, question="What is the estimated annual cost of endometriosis to the UK economy?",
            option_a="£1 million", option_b="£500 million", option_c="£8.2 billion", option_d="£20 billion", correct_option="C"),
    ])
    database.session.commit()

    # ============================================================== COURSE 9
    c9 = Course(
        title="Endometriosis and Relationships",
        description="Navigating intimacy, communication, and the impact of endometriosis on personal relationships — with partners, family, and friends.",
        created_by=admin.id,
    )
    database.session.add(c9)
    database.session.commit()

    m13 = Module(title="Intimacy and Communication", description="How endometriosis affects intimacy and how to talk about it.", course_id=c9.id, order_index=0)
    database.session.add(m13)
    database.session.commit()

    l27 = Lesson(title="Endometriosis and Sexual Intimacy", module_id=m13.id, content_type="text", order_index=0,
        text_content=(
            "Dyspareunia (painful sex) affects up to 50% of people with endometriosis and is one of the most impactful symptoms on relationships.\n\n"
            "Why sex can be painful:\n"
            "  Lesions on the uterosacral ligaments, recto-vaginal septum, or pelvic floor muscles cause pain with deep penetration or certain positions. "
            "Vaginal dryness from hormonal treatments can also cause discomfort.\n\n"
            "What can help:\n"
            "- Positions that allow you to control depth of penetration (e.g. side-lying, partner behind)\n"
            "- Adequate foreplay and lubrication\n"
            "- Pelvic floor physiotherapy to address muscle tension\n"
            "- Timing intimacy around lower-pain days in your cycle\n"
            "- Communicating openly with your partner before, during, and after\n\n"
            "It is okay to stop:\n"
            "  Sex should never be painful because you feel you have to endure it. Communicating boundaries clearly is essential. "
            "A supportive partner will want to know.\n\n"
            "When penetrative sex is not possible:\n"
            "  Intimacy and connection do not depend on penetrative sex. Exploring other forms of physical closeness is a valid and healthy approach."
        ))
    l28 = Lesson(title="Talking to Partners, Family and Friends", module_id=m13.id, content_type="text", order_index=1,
        text_content=(
            "Endometriosis is an invisible illness — people around you may not understand why you cancel plans, miss work, or struggle with intimacy.\n\n"
            "Talking to a partner:\n"
            "- Choose a calm moment, not during a flare\n"
            "- Use specific examples: 'On my worst days I cannot get out of bed'\n"
            "- Share resources — a short article or Endometriosis UK information can help them understand\n"
            "- Be clear about what support looks like: presence, practical help, or just not minimising your pain\n\n"
            "Talking to family:\n"
            "  Older generations may have been told painful periods are normal. Gentle education, without pressure to fully understand immediately, tends to work better than confrontation.\n\n"
            "Talking to friends:\n"
            "  It is okay to be selective about who you share with. A simple 'I have a chronic health condition that affects my energy' is enough for most social situations. "
            "True friends will want to adapt plans rather than lose you from their lives.\n\n"
            "When relationships are strained:\n"
            "  Couples therapy or relationship counselling can provide a safe space to work through the impact of chronic illness on a relationship. "
            "Seeking this is a sign of strength, not failure."
        ))
    database.session.add_all([l27, l28])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l27.id, question="What percentage of people with endometriosis experience painful sex?",
            options=["Up to 10%", "Up to 20%", "Up to 50%", "Up to 90%"], correct_option="C"),
        LessonQuiz(lesson_id=l27.id, question="Which specialist can help with pelvic floor muscle tension contributing to painful sex?",
            options=["Gynaecologist", "Pelvic floor physiotherapist", "Neurologist", "GP only"], correct_option="B"),
        LessonQuiz(lesson_id=l28.id, question="When is the best time to talk to a partner about endometriosis?",
            options=["During a severe flare", "In a calm moment outside of a flare", "Only when it affects them directly", "Never — it is too personal"], correct_option="B"),
        LessonQuiz(lesson_id=l28.id, question="What type of professional support can help couples navigate chronic illness?",
            options=["A pain specialist", "Couples therapy or relationship counselling", "A fertility consultant", "An occupational therapist"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m13.id, question="What is dyspareunia?",
            option_a="Heavy menstrual bleeding", option_b="Painful urination", option_c="Painful sex", option_d="Painful bowel movements", correct_option="C"),
        ModuleTest(module_id=m13.id, question="What can cause vaginal dryness worsening pain during sex in endometriosis?",
            option_a="High oestrogen levels", option_b="Hormonal treatments that reduce oestrogen", option_c="Pelvic floor weakness", option_d="Heavy periods", correct_option="B"),
        ModuleTest(module_id=m13.id, question="What is a helpful strategy for reducing pain during sex?",
            option_a="Avoiding all physical contact", option_b="Positions that allow control of penetration depth", option_c="Increasing the frequency of sex", option_d="Stopping all hormonal treatment", correct_option="B"),
        ModuleTest(module_id=m13.id, question="Why might older family members minimise endometriosis symptoms?",
            option_a="They have more medical knowledge", option_b="They may have been taught that painful periods are normal", option_c="They experienced endometriosis themselves", option_d="They do not care about the person", correct_option="B"),
    ])
    database.session.commit()

    # ============================================================== COURSE 10
    c10 = Course(
        title="Endometriosis in Teenagers and Young People",
        description="Endometriosis often begins in adolescence. This course covers early recognition, navigating school life, and getting the right support early.",
        created_by=admin.id,
    )
    database.session.add(c10)
    database.session.commit()

    m14 = Module(title="Recognising Endometriosis Early", description="Why early diagnosis matters and how symptoms present in young people.", course_id=c10.id, order_index=0)
    database.session.add(m14)
    database.session.commit()

    l29 = Lesson(title="Endometriosis in Adolescence", module_id=m14.id, content_type="text", order_index=0,
        text_content=(
            "Endometriosis can begin as soon as menstruation starts, yet it is rarely diagnosed in teenagers.\n\n"
            "Why it is missed in young people:\n"
            "- Painful periods are widely dismissed as a normal part of puberty\n"
            "- Teenagers may not have the vocabulary to describe their symptoms\n"
            "- There is a cultural tendency to tell young people to 'push through' period pain\n"
            "- GPs may be reluctant to consider endometriosis in patients under 18\n\n"
            "Warning signs in teenagers:\n"
            "- Period pain severe enough to miss school\n"
            "- Pain that does not respond to over-the-counter painkillers\n"
            "- Nausea and vomiting during periods\n"
            "- Pain outside of periods\n"
            "- Bowel or bladder symptoms that worsen during menstruation\n\n"
            "Why early diagnosis matters:\n"
            "  Early intervention can slow disease progression, improve quality of life, protect future fertility, and prevent years of unnecessary suffering. "
            "No young person should accept debilitating period pain as normal."
        ))
    l30 = Lesson(title="Getting Support at School and University", module_id=m14.id, content_type="text", order_index=1,
        text_content=(
            "Managing endometriosis in an educational setting presents unique challenges.\n\n"
            "At school:\n"
            "- Speak to the school nurse or a trusted teacher\n"
            "- Request a medical care plan so staff are aware of your condition\n"
            "- Ask for access to a toilet without having to ask permission in class\n"
            "- Discuss adjusted attendance targets with the SENCO if absences are frequent\n\n"
            "At university:\n"
            "- Register with the university's disability or student wellbeing service\n"
            "- Request a learning support plan which may include deadline extensions, exam concessions, and authorised absences\n"
            "- Communicate with your personal tutor — they can advocate for you with lecturers\n\n"
            "Exams:\n"
            "  Apply for special consideration or access arrangements if exams coincide with severe flares. "
            "Keep a medical record of your condition from your GP to support applications.\n\n"
            "Your parents or guardians:\n"
            "  Involving a parent or guardian in medical appointments can be helpful for younger teenagers. "
            "They can help advocate on your behalf and ensure concerns are taken seriously."
        ))
    database.session.add_all([l29, l30])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l29.id, question="When can endometriosis begin?",
            options=["Only after age 25", "Only after pregnancy", "As soon as menstruation starts", "Only after age 18"], correct_option="C"),
        LessonQuiz(lesson_id=l29.id, question="Which symptom in a teenager should prompt investigation for endometriosis?",
            options=["Mild cramps on day 1 of a period", "Period pain severe enough to miss school regularly", "Periods that last 5 days", "Occasional bloating"], correct_option="B"),
        LessonQuiz(lesson_id=l30.id, question="Who at school can help create a medical care plan?",
            options=["The headteacher only", "The school nurse or SENCO", "The school receptionist", "A fellow student"], correct_option="B"),
        LessonQuiz(lesson_id=l30.id, question="What university service supports students with chronic health conditions?",
            options=["The careers service", "The sports centre", "The disability or student wellbeing service", "The accommodation office"], correct_option="C"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m14.id, question="Why is endometriosis frequently missed in teenagers?",
            option_a="It does not exist before age 18", option_b="Painful periods are often dismissed as normal", option_c="Teenagers do not experience pelvic pain", option_d="There is a reliable blood test that rules it out", correct_option="B"),
        ModuleTest(module_id=m14.id, question="Which symptom combination most strongly suggests endometriosis in a teenager?",
            option_a="Mild cramps and regular cycles", option_b="Occasional headaches and fatigue", option_c="Severe period pain unresponsive to painkillers, nausea, and missing school", option_d="Light periods and mood changes", correct_option="C"),
        ModuleTest(module_id=m14.id, question="What is a learning support plan at university?",
            option_a="A timetable for lectures", option_b="A document outlining academic adjustments for a health condition", option_c="A meal plan for students with dietary needs", option_d="A financial support package", correct_option="B"),
        ModuleTest(module_id=m14.id, question="What can a parent or guardian do in medical appointments for a younger teenager?",
            option_a="Speak on their behalf without permission", option_b="Advocate for them and ensure concerns are taken seriously", option_c="Request a diagnosis on their behalf", option_d="Nothing — minors must attend alone", correct_option="B"),
    ])
    database.session.commit()

    # ============================================================== COURSE 11
    c11 = Course(
        title="Endometriosis and Menopause",
        description="How menopause affects endometriosis, what to expect when oestrogen declines, and guidance on HRT decisions for people with endometriosis.",
        created_by=admin.id,
    )
    database.session.add(c11)
    database.session.commit()

    m15 = Module(title="Endometriosis Through Menopause", description="What happens to endometriosis at menopause and how to manage the transition.", course_id=c11.id, order_index=0)
    database.session.add(m15)
    database.session.commit()

    l31 = Lesson(title="Does Menopause Cure Endometriosis?", module_id=m15.id, content_type="text", order_index=0,
        text_content=(
            "A common misconception is that menopause cures endometriosis. For many people it does not.\n\n"
            "What happens at menopause:\n"
            "  Oestrogen levels decline significantly. Because endometriosis is oestrogen-dependent, many people do experience symptom improvement or resolution after menopause.\n\n"
            "However:\n"
            "- Endometriosis lesions can persist and remain active in post-menopausal people\n"
            "- Symptoms including pelvic pain, bowel and bladder symptoms can continue\n"
            "- Lesions may still respond to oestrogen produced in small amounts by fat tissue (peripheral aromatisation)\n"
            "- Surgical menopause (removal of the ovaries) does not automatically cure endometriosis if lesions are not also excised\n\n"
            "Who is at higher risk of continued symptoms post-menopause?\n"
            "- Those with deep infiltrating endometriosis\n"
            "- Those who had incomplete surgical excision\n"
            "- Those who commence HRT after menopause\n\n"
            "The takeaway:\n"
            "  Menopause may bring relief, but it should not be relied upon as a treatment strategy. Ongoing specialist follow-up may be needed."
        ))
    l32 = Lesson(title="HRT and Endometriosis", module_id=m15.id, content_type="text", order_index=1,
        text_content=(
            "Hormone replacement therapy (HRT) is used to manage menopausal symptoms, but requires careful consideration in people with endometriosis.\n\n"
            "Why HRT is complicated in endometriosis:\n"
            "  HRT reintroduces oestrogen, which can potentially reactivate endometriosis lesions, even in post-menopausal people.\n\n"
            "Types of HRT:\n"
            "- Oestrogen-only HRT: not recommended for people with endometriosis (or anyone with a uterus) as it can stimulate residual lesions and the uterine lining\n"
            "- Combined HRT (oestrogen + progestogen): the preferred approach for people with endometriosis, as progestogen counteracts the stimulating effect of oestrogen\n"
            "- Tibolone: a synthetic HRT with mixed oestrogenic, progestogenic and androgenic activity; may be considered in some cases\n\n"
            "After surgical menopause:\n"
            "  Starting HRT immediately after oophorectomy (ovary removal) is generally recommended to protect bone density and cardiovascular health, "
            "particularly in younger patients. The benefits outweigh risks in most cases when combined HRT is used.\n\n"
            "Always discuss:\n"
            "  HRT decisions should be made with a specialist who understands both menopause and endometriosis. There is no one-size-fits-all answer."
        ))
    database.session.add_all([l31, l32])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l31.id, question="Does menopause always cure endometriosis?",
            options=["Yes, always", "Yes, but only natural menopause", "No, lesions can persist and remain active post-menopause", "Only if oestrogen reaches zero"], correct_option="C"),
        LessonQuiz(lesson_id=l31.id, question="What is peripheral aromatisation?",
            options=["A surgical technique", "Oestrogen production in fat tissue even after menopause", "A type of HRT", "A diagnostic scan"], correct_option="B"),
        LessonQuiz(lesson_id=l32.id, question="Why is oestrogen-only HRT not recommended for people with endometriosis?",
            options=["It causes weight gain", "It can reactivate residual endometriosis lesions", "It reduces bone density", "It is not available in the UK"], correct_option="B"),
        LessonQuiz(lesson_id=l32.id, question="Which type of HRT is preferred for people with endometriosis?",
            options=["Oestrogen-only HRT", "Combined oestrogen and progestogen HRT", "Testosterone-only HRT", "No HRT is ever suitable"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m15.id, question="Why might endometriosis continue after menopause?",
            option_a="Oestrogen levels increase after menopause", option_b="Lesions can persist and respond to oestrogen from fat tissue", option_c="The immune system stops working", option_d="Menopause always worsens endometriosis", correct_option="B"),
        ModuleTest(module_id=m15.id, question="What type of HRT is generally preferred for people with endometriosis?",
            option_a="Oestrogen-only", option_b="Combined oestrogen and progestogen", option_c="Testosterone-only", option_d="Progesterone-only patches", correct_option="B"),
        ModuleTest(module_id=m15.id, question="Why might HRT be recommended after surgical menopause in younger patients?",
            option_a="To restart periods", option_b="To protect bone density and cardiovascular health", option_c="To reactivate lesions", option_d="It is never recommended after surgery", correct_option="B"),
        ModuleTest(module_id=m15.id, question="What is the main concern about oestrogen reintroduced via HRT in endometriosis?",
            option_a="It causes fertility problems", option_b="It can reactivate residual lesions", option_c="It always causes weight gain", option_d="It has no known risks", correct_option="B"),
    ])
    database.session.commit()

    # ============================================================== COURSE 12
    c12 = Course(
        title="Complementary Therapies for Endometriosis",
        description="An evidence-informed look at complementary approaches — acupuncture, TENS, yoga, mindfulness and more — and how they fit alongside conventional treatment.",
        created_by=admin.id,
    )
    database.session.add(c12)
    database.session.commit()

    m16 = Module(title="Evidence-Based Complementary Approaches", description="What the evidence says about complementary therapies for endometriosis pain.", course_id=c12.id, order_index=0)
    database.session.add(m16)
    database.session.commit()

    l33 = Lesson(title="Acupuncture, TENS and Heat Therapy", module_id=m16.id, content_type="text", order_index=0,
        text_content=(
            "Complementary therapies do not treat the underlying disease but can play a meaningful role in symptom management.\n\n"
            "Acupuncture:\n"
            "  Several studies support acupuncture for reducing dysmenorrhoea and chronic pelvic pain. "
            "It is thought to modulate pain pathways and reduce prostaglandin production. "
            "NICE guidelines acknowledge its potential role in chronic pain management. "
            "A course of 6–10 sessions is typically required before judging benefit.\n\n"
            "TENS (Transcutaneous Electrical Nerve Stimulation):\n"
            "  Delivers mild electrical pulses through the skin to disrupt pain signals. "
            "Evidence for period pain is good — a TENS machine can be purchased for home use. "
            "Place electrode pads on the lower abdomen or lower back during a flare.\n\n"
            "Heat therapy:\n"
            "  Heat applied to the abdomen or lower back is one of the most simple and effective short-term pain relief methods. "
            "A study found that heat at 39°C was as effective as ibuprofen for dysmenorrhoea. "
            "Heat patches worn under clothing allow use during daily activities."
        ))
    l34 = Lesson(title="Yoga, Mindfulness and Movement", module_id=m16.id, content_type="text", order_index=1,
        text_content=(
            "Mind-body approaches have growing evidence for managing chronic pain and improving quality of life.\n\n"
            "Yoga:\n"
            "  Specific yoga practices for pelvic pain focus on gentle hip opening, stretching the psoas and piriformis muscles, and diaphragmatic breathing. "
            "Yin yoga and restorative yoga are particularly well-tolerated during flares. "
            "Studies show yoga reduces pain intensity and improves mental wellbeing in people with endometriosis.\n\n"
            "Mindfulness-Based Stress Reduction (MBSR):\n"
            "  The 8-week MBSR programme combines meditation, body scan, and mindful movement. "
            "Evidence shows it reduces pain catastrophising (the tendency to expect the worst from pain), anxiety, and improves pain coping.\n\n"
            "Breathing techniques:\n"
            "  Slow diaphragmatic breathing activates the parasympathetic nervous system, reducing the stress response that amplifies pain. "
            "The 4-7-8 technique (inhale 4 counts, hold 7, exhale 8) can help during acute pain episodes.\n\n"
            "Swimming and walking:\n"
            "  Low-impact aerobic exercise reduces inflammation and improves mood via endorphin release. "
            "Even gentle daily walking has measurable benefits for chronic pain."
        ))
    database.session.add_all([l33, l34])
    database.session.commit()

    database.session.add_all([
        LessonQuiz(lesson_id=l33.id, question="What does TENS stand for?",
            options=["Thermal Energy Nerve Stimulation", "Transcutaneous Electrical Nerve Stimulation", "Targeted Endometriosis Nerve Support", "Transdermal Endorphin Nerve System"], correct_option="B"),
        LessonQuiz(lesson_id=l33.id, question="A study found that heat at 39°C was as effective as which medication for dysmenorrhoea?",
            options=["Morphine", "Paracetamol", "Ibuprofen", "Gabapentin"], correct_option="C"),
        LessonQuiz(lesson_id=l34.id, question="Which type of yoga is particularly well-tolerated during endometriosis flares?",
            options=["Hot yoga (Bikram)", "Ashtanga yoga", "Power yoga", "Yin or restorative yoga"], correct_option="D"),
        LessonQuiz(lesson_id=l34.id, question="What is 'pain catastrophising'?",
            options=["Exaggerating pain for attention", "The tendency to expect the worst outcome from pain", "A medical emergency", "A side effect of opioid medication"], correct_option="B"),
    ])
    database.session.commit()

    database.session.add_all([
        ModuleTest(module_id=m16.id, question="How many acupuncture sessions are typically needed before assessing benefit?",
            option_a="1–2", option_b="3–4", option_c="6–10", option_d="20+", correct_option="C"),
        ModuleTest(module_id=m16.id, question="Where should TENS electrode pads be placed for endometriosis pain?",
            option_a="On the upper back and shoulders", option_b="On the lower abdomen or lower back", option_c="On the wrists", option_d="On the thighs", correct_option="B"),
        ModuleTest(module_id=m16.id, question="What nervous system does diaphragmatic breathing activate?",
            option_a="Sympathetic nervous system", option_b="Somatic nervous system", option_c="Parasympathetic nervous system", option_d="Central nervous system only", correct_option="C"),
        ModuleTest(module_id=m16.id, question="What is the main benefit of low-impact aerobic exercise for chronic pain?",
            option_a="It eliminates endometriosis lesions", option_b="It reduces inflammation and improves mood via endorphin release", option_c="It replaces the need for medication", option_d="It increases oestrogen levels", correct_option="B"),
    ])
    database.session.commit()

    # --------------------------------------------------------- LESSON PROGRESS
    all_lessons = [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15, l16, l17, l18]
    now = datetime.utcnow()

    # Alice has completed course 1 fully and started course 2
    alice_completed = all_lessons[:5]
    alice_started   = all_lessons[5:8]

    for i, lesson in enumerate(alice_completed):
        database.session.add(LessonProgress(
            lesson_id=lesson.id, user_id=alice.id,
            is_completed=True, completed_at=now - timedelta(days=len(alice_completed) - i)
        ))
    for lesson in alice_started:
        database.session.add(LessonProgress(
            lesson_id=lesson.id, user_id=alice.id, is_completed=False
        ))

    # Sarah has completed course 2 partially
    for i, lesson in enumerate(all_lessons[5:9]):
        database.session.add(LessonProgress(
            lesson_id=lesson.id, user_id=sarah.id,
            is_completed=True, completed_at=now - timedelta(days=4 - i)
        ))

    database.session.commit()

    # ------------------------------------------------------------ COMMENTS
    database.session.add_all([
        LessonComment(lesson_id=l1.id, user_id=alice.id,
            comment_text="Finally a clear explanation of what endometriosis actually is. Thank you."),
        LessonComment(lesson_id=l2.id, user_id=sarah.id,
            comment_text="I had no idea family history was such a significant risk factor."),
        LessonComment(lesson_id=l4.id, user_id=alice.id,
            comment_text="Glad dyspareunia is included here — it took me years to realise that wasn't normal."),
        LessonComment(lesson_id=l5.id, user_id=emma.id,
            comment_text="7 to 10 years for a diagnosis is shocking. This needs to change."),
        LessonComment(lesson_id=l6.id, user_id=sarah.id,
            comment_text="Really helpful breakdown of the different hormonal options. I didn't know about dienogest."),
        LessonComment(lesson_id=l10.id, user_id=alice.id,
            comment_text="The anti-inflammatory diet section is really practical without being preachy. Appreciated."),
    ])
    database.session.commit()

    # ---------------------------------------------------------- CERTIFICATE
    import uuid
    database.session.add(Certificate(
        user_id=alice.id,
        course_id=c1.id,
        title="Understanding Endometriosis — Completion Certificate",
        issued_at=now - timedelta(days=1),
        certificate_code=str(uuid.uuid4())[:12].upper(),
    ))
    database.session.commit()

    logging.info("Demo data seeded: 3 endometriosis courses, 6 modules, 13 lessons, quizzes, tests, progress and comments.")


def main() -> None:
    """Create all database tables and seed initial demo data."""
    app = server.create_app()
    with app.app_context():
        if os.getenv("RESET_DB") == "true":
            logging.warning("RESET_DB=true – dropping all tables...")
            database.drop_all()

        database.create_all()
        logging.info("Database tables created successfully.")
        _seed_initial_data()


if __name__ == "__main__":
    main()
