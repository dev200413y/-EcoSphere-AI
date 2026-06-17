import { useState, useEffect } from 'react';
import { Camera, CheckCircle, Clock, Zap, Leaf, UploadCloud } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Quests.css';

function Quests() {
  const [quests, setQuests] = useState([]);
  const [activeQuest, setActiveQuest] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [completedQuests, setCompletedQuests] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Quests
      const snap = await getDocs(collection(db, 'quests'));
      setQuests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      // Fetch User's completed quests
      const userRef = doc(db, 'users', 'demo_user_123');
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().completedQuests) {
        setCompletedQuests(userSnap.data().completedQuests);
      }
    };
    fetchData();
  }, []);

  const handleStartQuest = (quest) => {
    setActiveQuest(quest);
    setCameraOpen(true);
    setVerified(false);
    setVerificationFailed(null);
    setUploadedImage(null);
    setBase64Image(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create local URL for preview
      setUploadedImage(URL.createObjectURL(file));
      
      // Read as Base64 for Mistral API
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyWithMistral = async () => {
    if (!base64Image) return;
    setScanning(true);
    setVerificationFailed(null);

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "pixtral-12b-2409",
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: `Analyze this image strictly. The user is trying to complete an eco-task: "${activeQuest.title}". The proof required is: "${activeQuest.description}". Does this image clearly show the required proof? If yes, reply with exactly "YES". If no, reply with exactly "NO" followed by a short 1-sentence reason why.`
                },
                { 
                  type: "image_url", 
                  image_url: { url: base64Image } 
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();

      if (aiResponse.startsWith("YES")) {
        setVerified(true);
        rewardUser(activeQuest.points, activeQuest.id);
      } else {
        setVerificationFailed(aiResponse.replace("NO", "").trim() || "Image does not match the required task.");
      }
    } catch (error) {
      console.error("Mistral API Error:", error);
      setVerificationFailed("AI Verification failed due to a network error. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const rewardUser = async (points, questId) => {
    try {
      const userRef = doc(db, 'users', 'demo_user_123');
      const newCompleted = { ...completedQuests, [questId]: true };
      
      await updateDoc(userRef, {
        ecoPoints: increment(points),
        streak: increment(1),
        completedQuests: newCompleted
      });
      
      setCompletedQuests(newCompleted);
    } catch (e) {
      console.error("Error rewarding user", e);
    }
  };

  const closeCamera = () => {
    setCameraOpen(false);
    setActiveQuest(null);
    setVerified(false);
    setVerificationFailed(null);
  };

  return (
    <div className="quests-container">
      <header className="page-header">
        <div>
          <h2>Daily Eco-Quests</h2>
          <p className="text-secondary">Prove your actions with AI and grow your Tree of Life.</p>
        </div>
      </header>

      {cameraOpen ? (
        <div className="camera-view glass-panel">
          <h3>{activeQuest.title}</h3>
          <p>{activeQuest.description}</p>
          
          <div className="viewfinder">
            {scanning && <div className="scan-line"></div>}
            
            {uploadedImage ? (
              <img src={uploadedImage} alt="Uploaded Proof" className="uploaded-preview" />
            ) : (
              <div className="upload-placeholder">
                <input type="file" id="proof-upload" accept="image/*" onChange={handleImageUpload} hidden />
                <label htmlFor="proof-upload" className="upload-label">
                  <UploadCloud size={48} />
                  <span>Click to Upload Photo</span>
                </label>
              </div>
            )}

            {verified && <div className="success-overlay"><CheckCircle size={64} className="text-green-500" /><h2>AI Verified!</h2><p>+{activeQuest.points} Points</p></div>}
            {verificationFailed && (
              <div className="error-overlay">
                <div className="error-box">
                  <h3>Verification Failed</h3>
                  <p>{verificationFailed}</p>
                  <button className="btn-secondary mt-3" onClick={() => {setVerificationFailed(null); setUploadedImage(null);}}>Try Again</button>
                </div>
              </div>
            )}
          </div>

          <div className="camera-controls">
            {!verified ? (
              <button className="btn-primary" onClick={verifyWithMistral} disabled={scanning || !base64Image}>
                {scanning ? 'AI Verifying...' : 'Verify Image'}
              </button>
            ) : (
              <button className="btn-secondary" onClick={closeCamera}>Return to Quests</button>
            )}
            {!scanning && !verified && <button className="btn-ghost" onClick={closeCamera}>Cancel</button>}
          </div>
        </div>
      ) : (
        <div className="quests-grid">
          {quests.map(quest => (
            <div key={quest.id} className="quest-card glass-panel">
              <div className="quest-icon">
                {quest.type === 'Health' ? <Leaf /> : quest.type === 'Transport' ? <Zap /> : <Clock />}
              </div>
              <div className="quest-details">
                <h3>{quest.title}</h3>
                <p className="text-secondary">{quest.description}</p>
                <div className="quest-meta">
                  <span className="points-badge">+{quest.points} Pts</span>
                  <span className="type-badge">{quest.type}</span>
                </div>
              </div>
              {completedQuests[quest.id] ? (
                <button className="btn-ghost completed-btn" disabled>
                  <CheckCircle size={18} /> Completed
                </button>
              ) : (
                <button className="btn-primary" onClick={() => handleStartQuest(quest)}>Prove It</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Quests;
