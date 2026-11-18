import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Cloud, Code2, MapPin, Sparkles, Target, Users } from "lucide-react";
import { PageHero } from "../components/Page";
import Reveal from "../components/Reveal";
import TextReveal from "../components/TextReveal";
import { useDocumentTitle } from "../lib/hooks";

const focusAreas = [
  { icon: Cloud, label: "Cloud computing", detail: "Understand the building blocks of modern infrastructure" },
  { icon: Code2, label: "Serverless & software", detail: "Turn ideas into working, deployable systems" },
  { icon: Sparkles, label: "AI & machine learning", detail: "Explore what intelligent applications can do" },
];

const values = [
  { title: "Learn in the open", body: "Sessions and resources are shared with everyone, from first-year beginners to final-year specialists." },
  { title: "Build real things", body: "We focus on hands-on work — workshops, projects, and hackathons over passive theory." },
  { title: "Grow by helping", body: "Members teach each other. Every builder lifts the community by sharing what they learn." },
];

export default function About() {
  useDocumentTitle("About the community");

  return (
    <>
      <PageHero
        index="ABOUT"
        eyebrow="THE COMMUNITY"
        title="More than a club."
        highlight="A builder culture."
        intro="We are a student-led campus community for anyone curious about cloud technology at Amity University Patna. Here, curiosity becomes working projects."
        actions={
          <>
            <Link className="button button-orange" to="/members">
              Meet the builders <ArrowRight size={15} />
            </Link>
            <Link className="text-link text-link-light" to="/events">
              See what&apos;s happening <ArrowUpRight size={15} />
            </Link>
          </>
        }
      />

      <section className="section-pad content-section bg-grid">
        <div className="section-index">
          <span>01</span>
          <span className="index-rule" /> MISSION
        </div>
        <div className="intro-grid">
          <Reveal className="intro-heading">
            <p className="eyebrow">WHY WE EXIST</p>
            <h2>
              <TextReveal as="span" mode="word" stagger={55}>
                Cloud skills for
              </TextReveal>
              <br />
              <span>
                <TextReveal as="span" mode="word" stagger={55} delay={200}>
                  every branch.
                </TextReveal>
              </span>
            </h2>
          </Reveal>
          <Reveal className="intro-copy" delay={80}>
            <p className="intro-lede">
              Our mission is to make AWS and cloud skills approachable for every student, whatever
              their branch or starting point.
            </p>
            <p>
              <b>Our vision</b> is a campus where curiosity becomes working projects and where
              builders grow by helping one another.
            </p>
            <p>
              <b>What we do:</b> hands-on workshops, cloud and serverless sessions, hackathons, and
              time to work on ideas together.
            </p>
            <div className="focus-list">
              {focusAreas.map(({ icon: Icon, label, detail }) => (
                <div className="focus-row" key={label}>
                  <span className="focus-icon">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <span className="focus-label">
                    {label}
                    <small>{detail}</small>
                  </span>
                  <ArrowUpRight size={15} className="focus-arrow" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad content-section values-section bg-grid">
        <div className="section-index">
          <span>02</span>
          <span className="index-rule" /> HOW WE WORK
        </div>
        <div className="value-grid">
          {values.map((value, index) => (
            <Reveal className="value-card" key={value.title} delay={index * 70}>
              <span className="value-index">0{index + 1}</span>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="leader-section section-pad">
        <div className="section-index section-index-light">
          <span>03</span>
          <span className="index-rule" /> THE LEAD
        </div>
        <article className="leader-card">
          <div className="leader-photo-wrap">
            <img
              className="leader-photo"
              src="/assets/ayush-kumar.jpg"
              alt="Ayush Kumar, AWS Student Builder Group Leader"
              loading="lazy"
            />
            <span className="photo-caption">CAMPUS BUILDER / 001</span>
          </div>
          <div className="leader-details">
            <div className="leader-role">
              <span className="live-dot" /> STUDENT BUILDER GROUP LEADER
            </div>
            <h3>
              Ayush Kumar<span>.</span>
            </h3>
            <p className="leader-study">B.Tech CSE · Artificial Intelligence &amp; Machine Learning · Year 2</p>
            <p className="leader-bio">
              At Amity School of Engineering and Technology, Ayush leads campus-wide cloud
              initiatives, brings hands-on workshops to students, and helps grow a builder-first
              developer community. He is also a core team member of AWS User Group Bihar.
            </p>
            <div className="leader-interests">
              <span>CLOUD ARCHITECTURE</span>
              <span>GENERATIVE AI</span>
              <span>FULL-STACK DEVELOPMENT</span>
            </div>
            <div className="leader-foot">
              <span>
                AMITY UNIVERSITY PATNA
                <br />
                PATNA, BIHAR, INDIA
              </span>
              <span className="leader-monogram">
                AK<span> / BUILDER</span>
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="section-pad content-section">
        <div className="section-index">
          <span>04</span>
          <span className="index-rule" /> WHERE TO FIND US
        </div>
        <div className="about-contact">
          <div className="contact-place">
            <MapPin size={16} />
            <span>
              AMITY UNIVERSITY PATNA
              <small>Patna, Bihar, India</small>
            </span>
          </div>
          <div className="about-actions">
            <Link className="button button-orange" to="/auth/signup">
              <Users size={15} /> Join the community
            </Link>
            <Link className="text-link" to="/suggestions">
              <Target size={15} /> Share an idea
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
