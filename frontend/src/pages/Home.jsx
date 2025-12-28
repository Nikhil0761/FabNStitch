import { Helmet } from "react-helmet-async";

import Hero from '../components/Hero';
import Features from '../components/Features';
import Clients from '../components/Clients';
import Reviews from '../components/Reviews';
import GetStarted from '../components/GetStarted';
import OurStory from '../components/OurStory';
import OurFacilities from '../components/OurFacilities';

function Home() {
  return (
    <>
      <Helmet>
        <title>FabNStitch™ | Premium Uniform Manufacturing for Colleges & Corporates</title>
        <meta
          name="description"
          content="FabNStitch™ manufactures premium uniforms for colleges, corporates, and institutions with custom fit, quality fabric, and precision stitching."
        />
        <link rel="canonical" href="https://www.fabnstitch.com/" />
      </Helmet>

      <Hero />
      <OurFacilities />
      <OurStory />
      <Clients />
      <Features />
      <Reviews />
      <GetStarted />
    </>
  );
}

export default Home;
