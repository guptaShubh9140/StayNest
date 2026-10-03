import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";

const Home = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: "Verified Properties",
      description:
        "Discover approved PGs, hostels and co-living spaces through one trusted platform.",
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      icon: Clock3,
      title: "Simple Booking",
      description:
        "Compare rooms, check pricing and send your booking request through a simple flow.",
      iconClass: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: WalletCards,
      title: "Secure Payments",
      description:
        "Complete confirmed bookings through the integrated payment experience.",
      iconClass: "bg-purple-50 text-purple-600",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Explore",
      description:
        "Search PGs, hostels and co-living spaces based on your preferences.",
      icon: Search,
    },
    {
      number: "02",
      title: "Choose",
      description:
        "Compare rooms, amenities, pricing and property information before booking.",
      icon: Building2,
    },
    {
      number: "03",
      title: "Book",
      description:
        "Submit your booking request and complete payment after confirmation.",
      icon: CheckCircle2,
    },
  ];

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-gray-50">
        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden bg-white">
          {/* Background decoration */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute -right-40 -top-40
              h-[420px] w-[420px] rounded-full
              bg-blue-100/70 blur-3xl
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute -bottom-40 -left-40
              h-[420px] w-[420px] rounded-full
              bg-indigo-100/60 blur-3xl
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute left-1/2 top-1/3
              h-40 w-40 -translate-x-1/2 rounded-full
              bg-purple-100/40 blur-3xl
            "
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
            <div className="mx-auto max-w-5xl text-center">
              {/* Badge */}
              <div
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-blue-100 bg-blue-50
                  px-3.5 py-2 text-xs font-semibold
                  text-blue-700 shadow-sm sm:text-sm
                "
              >
                <Sparkles size={15} strokeWidth={2} aria-hidden="true" />

                <span>Find your next stay with StayNest</span>
              </div>

              {/* Heading */}
              <h1
                className="
                  mt-6 text-4xl font-bold leading-[1.08]
                  tracking-tight text-gray-950
                  sm:text-5xl md:text-6xl
                  lg:text-7xl
                "
              >
                Find a place
                <span className="block text-blue-600">
                  you&apos;ll love to stay.
                </span>
              </h1>

              {/* Description */}
              <p
                className="
                  mx-auto mt-6 max-w-2xl
                  text-base leading-7 text-gray-600
                  sm:text-lg sm:leading-8
                "
              >
                Discover verified PGs, hostels and co-living spaces near your
                college or workplace.
              </p>

              {/* CTA */}
              <div
                className="
                  mt-8 flex flex-col items-stretch
                  justify-center gap-3 sm:mt-10
                  sm:flex-row sm:items-center
                "
              >
                <Link
                  to="/properties"
                  className="
    inline-flex min-h-12 w-full
    items-center justify-center gap-2
    rounded-xl bg-blue-600
    px-5 py-3 text-sm font-semibold
    text-white shadow-sm
    transition-all duration-200
    hover:bg-blue-700
    hover:shadow-md
    focus:outline-none
    focus:ring-2 focus:ring-blue-500
    focus:ring-offset-2
    sm:w-auto
  "
                >
                  <span>Find Your Stay</span>

                  <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
                </Link>

                <Link
                  to="/properties"
                  className="
                    inline-flex min-h-12 w-full
                    items-center justify-center gap-2
                    rounded-xl border border-gray-200
                    bg-white px-5 py-3 text-sm
                    font-semibold text-gray-700
                    shadow-sm transition-all duration-200
                    hover:border-gray-300
                    hover:bg-gray-50 hover:shadow
                    focus:outline-none
                    focus:ring-2 focus:ring-blue-500
                    focus:ring-offset-2
                    sm:w-auto
                  "
                >
                  Explore Properties
                </Link>
              </div>
            </div>

            {/* =================================================
                SEARCH PREVIEW
            ================================================== */}
            <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
              <div
                className="
                  rounded-3xl border border-gray-200
                  bg-white p-3 shadow-2xl
                  shadow-gray-200/60 sm:p-4
                "
              >
                <div
                  className="
                    grid gap-2 md:grid-cols-[1fr_1fr_auto]
                  "
                >
                  {/* Location */}
                  <div
                    className="
                      group rounded-2xl border
                      border-gray-200 bg-gray-50
                      px-4 py-3.5 transition
                      hover:border-blue-200
                      hover:bg-blue-50/40
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex h-10 w-10 shrink-0
                          items-center justify-center
                          rounded-xl bg-white
                          text-blue-600 shadow-sm
                        "
                      >
                        <MapPin size={19} strokeWidth={2} aria-hidden="true" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px] font-bold uppercase
                            tracking-wider text-gray-400
                          "
                        >
                          Location
                        </p>

                        <p
                          className="
                            mt-0.5 truncate text-sm
                            font-semibold text-gray-800
                          "
                        >
                          Where do you want to stay?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div
                    className="
                      group rounded-2xl border
                      border-gray-200 bg-gray-50
                      px-4 py-3.5 transition
                      hover:border-blue-200
                      hover:bg-blue-50/40
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex h-10 w-10 shrink-0
                          items-center justify-center
                          rounded-xl bg-white
                          text-indigo-600 shadow-sm
                        "
                      >
                        <Building2
                          size={19}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px] font-bold uppercase
                            tracking-wider text-gray-400
                          "
                        >
                          Property Type
                        </p>

                        <p
                          className="
                            mt-0.5 truncate text-sm
                            font-semibold text-gray-800
                          "
                        >
                          PG, Hostel or Co-living
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search */}
                  <Link
                    to="/properties"
                    className="
                      inline-flex min-h-[68px]
                      items-center justify-center
                      gap-2 rounded-2xl
                      bg-gray-950 px-6
                      text-sm font-semibold text-white
                      shadow-sm transition-all duration-200
                      hover:bg-gray-800
                      hover:shadow-lg
                      focus:outline-none
                      focus:ring-2 focus:ring-gray-900
                      focus:ring-offset-2
                    "
                  >
                    <Search size={18} strokeWidth={2} aria-hidden="true" />
                    Search Properties
                  </Link>
                </div>

                {/* Search helper */}
                <div
                  className="
                    mt-3 flex items-center justify-center
                    gap-2 text-xs text-gray-500
                  "
                >
                  <CheckCircle2
                    size={14}
                    className="text-green-600"
                    aria-hidden="true"
                  />

                  <span>Explore approved properties available on StayNest</span>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div
              className="
                mx-auto mt-8 flex max-w-3xl
                flex-wrap items-center justify-center
                gap-x-6 gap-y-3 text-xs
                font-medium text-gray-500 sm:text-sm
              "
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={15}
                  className="text-green-600"
                  aria-hidden="true"
                />
                Verified properties
              </span>

              <span className="hidden h-4 w-px bg-gray-200 sm:block" />

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={15}
                  className="text-green-600"
                  aria-hidden="true"
                />
                Simple booking
              </span>

              <span className="hidden h-4 w-px bg-gray-200 sm:block" />

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={15}
                  className="text-green-600"
                  aria-hidden="true"
                />
                Secure payments
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            BENEFITS
        ====================================================== */}
        <section className="border-y border-gray-100 bg-gray-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="
                  text-xs font-bold uppercase
                  tracking-[0.18em] text-blue-600
                "
              >
                Why StayNest
              </p>

              <h2
                className="
                  mt-3 text-3xl font-bold
                  tracking-tight text-gray-950
                  sm:text-4xl
                "
              >
                Everything you need to find your stay
              </h2>

              <p
                className="
                  mt-4 text-sm leading-6 text-gray-600
                  sm:text-base
                "
              >
                A simpler way to discover, compare and manage your
                accommodation.
              </p>
            </div>

            <div
              className="
                mt-10 grid gap-5
                sm:grid-cols-2 lg:grid-cols-3
              "
            >
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="
                      group rounded-2xl border
                      border-gray-200 bg-white p-6
                      shadow-sm transition-all duration-300
                      hover:-translate-y-1
                      hover:border-gray-300
                      hover:shadow-xl
                    "
                  >
                    <div
                      className={`
                        flex h-12 w-12
                        items-center justify-center
                        rounded-2xl
                        ${benefit.iconClass}
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      `}
                    >
                      <Icon size={23} strokeWidth={1.9} aria-hidden="true" />
                    </div>

                    <h3
                      className="
                        mt-5 text-lg font-bold
                        text-gray-950
                      "
                    >
                      {benefit.title}
                    </h3>

                    <p
                      className="
                        mt-2 text-sm leading-6
                        text-gray-600
                      "
                    >
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}
        <section className="bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="
                  text-xs font-bold uppercase
                  tracking-[0.18em] text-blue-600
                "
              >
                How StayNest works
              </p>

              <h2
                className="
                  mt-3 text-3xl font-bold
                  tracking-tight text-gray-950
                  sm:text-4xl
                "
              >
                Find your stay in three simple steps
              </h2>

              <p
                className="
                  mt-4 text-sm leading-6 text-gray-600
                  sm:text-base
                "
              >
                From discovering a property to submitting your booking request,
                StayNest keeps the experience simple.
              </p>
            </div>

            <div
              className="
                relative mt-12 grid gap-5
                md:grid-cols-3 md:gap-6
              "
            >
              {/* Connecting line */}
              <div
                aria-hidden="true"
                className="
                  absolute left-[16.66%]
                  right-[16.66%] top-12
                  hidden h-px bg-gray-200
                  md:block
                "
              />

              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="
                      relative rounded-2xl
                      border border-gray-200
                      bg-gray-50 p-6
                      transition-all duration-300
                      hover:-translate-y-1
                      hover:bg-white
                      hover:shadow-lg
                    "
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div
                        className="
                          flex h-12 w-12
                          items-center justify-center
                          rounded-2xl bg-blue-600
                          text-white shadow-md
                        "
                      >
                        <Icon size={21} strokeWidth={2} aria-hidden="true" />
                      </div>

                      <span
                        className="
                          text-4xl font-black
                          tracking-tight text-gray-200
                        "
                      >
                        {step.number}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-6 text-lg font-bold
                        text-gray-950
                      "
                    >
                      {step.title}
                    </h3>

                    <p
                      className="
                        mt-2 text-sm leading-6
                        text-gray-600
                      "
                    >
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
    CTA
====================================================== */}
        <section className="bg-slate-950">
          <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div
              className="
        relative overflow-hidden
        rounded-3xl bg-blue-600
        px-6 py-12 text-center
        shadow-2xl sm:px-10 sm:py-16
      "
            >
              {/* Decorative circles */}
              <div
                aria-hidden="true"
                className="
          pointer-events-none absolute
          -right-20 -top-20 h-56 w-56
          rounded-full bg-white/10
        "
              />

              <div
                aria-hidden="true"
                className="
          pointer-events-none absolute
          -bottom-24 -left-16 h-64 w-64
          rounded-full bg-white/10
        "
              />

              <div className="relative">
                <div
                  className="
            mx-auto flex h-12 w-12
            items-center justify-center
            rounded-2xl bg-white/15
            text-white
          "
                >
                  <Sparkles size={23} strokeWidth={2} aria-hidden="true" />
                </div>

                <h2
                  className="
            mt-5 text-2xl font-bold
            tracking-tight text-white
            sm:text-3xl md:text-4xl
          "
                >
                  Ready to find your next stay?
                </h2>

                <p
                  className="
            mx-auto mt-4 max-w-2xl
            text-sm leading-6 text-blue-100
            sm:text-base
          "
                >
                  Explore available properties and find a place that fits your
                  needs.
                </p>

                <Link
                  to="/properties"
                  className="
            mt-7 inline-flex min-h-12
            w-full items-center
            justify-center gap-2 rounded-xl
            bg-white px-6 py-3.5
            text-sm font-bold text-blue-700
            shadow-lg transition-all duration-200
            hover:bg-blue-50
            hover:shadow-xl
            focus:outline-none
            focus:ring-2 focus:ring-white
            focus:ring-offset-2
            focus:ring-offset-blue-600
            sm:w-auto
          "
                >
                  Explore Properties
                  <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
