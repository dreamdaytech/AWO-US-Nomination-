import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  increment
} from "firebase/firestore";
import { Nomination, Nominee, Message, TimelineSettings, UserVote, NomineeGroup, GroupingAuditLog } from "./types";

export const dbService = {
  // Listeners
  listenToSettings: (callback: (settings: TimelineSettings) => void) => {
    return onSnapshot(doc(db, "settings", "timeline"), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as TimelineSettings);
      }
    });
  },
  listenToDate: (callback: (date: string) => void) => {
    return onSnapshot(doc(db, "settings", "system"), (doc) => {
      if (doc.exists() && doc.data().simulatedDate) {
        callback(doc.data().simulatedDate);
      }
    });
  },
  listenToNominations: (callback: (nominations: Nomination[]) => void) => {
    return onSnapshot(collection(db, "nominations"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Nomination));
      callback(data);
    });
  },
  listenToMessages: (callback: (messages: Message[]) => void) => {
    return onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(data);
    });
  },
  // Nominees are dynamic but wait, in localStorage they are just based on INITIAL_NOMINEES + approved nominations. 
  // Let's store them in firestore for real since it's a db.
  listenToNominees: (callback: (nominees: Nominee[]) => void) => {
    return onSnapshot(collection(db, "nominees"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Nominee));
      callback(data);
    });
  },
  
  listenToNomineeGroups: (callback: (groups: NomineeGroup[]) => void) => {
    return onSnapshot(collection(db, "nomineeGroups"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NomineeGroup));
      callback(data);
    });
  },

  listenToGroupingAuditLogs: (callback: (logs: GroupingAuditLog[]) => void) => {
    return onSnapshot(query(collection(db, "groupingAuditLogs"), orderBy("timestamp", "desc")), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupingAuditLog));
      callback(data);
    });
  },
  
  // Mutations
  updateSettings: (settings: TimelineSettings) => {
    return setDoc(doc(db, "settings", "timeline"), settings, { merge: true });
  },
  updateSimulatedDate: (date: string) => {
    return setDoc(doc(db, "settings", "system"), { simulatedDate: date }, { merge: true });
  },
  addNomination: (nom: Omit<Nomination, 'id'>) => {
    return addDoc(collection(db, "nominations"), nom);
  },
  updateNomination: (id: string, data: Partial<Nomination>) => {
    return updateDoc(doc(db, "nominations", id), data);
  },
  deleteNomination: (id: string) => {
    return deleteDoc(doc(db, "nominations", id));
  },
  addNomineeGroup: (group: Omit<NomineeGroup, 'id'>) => {
    return addDoc(collection(db, "nomineeGroups"), group);
  },
  updateNomineeGroup: (id: string, data: Partial<NomineeGroup>) => {
    return updateDoc(doc(db, "nomineeGroups", id), data);
  },
  deleteNomineeGroup: (id: string) => {
    return deleteDoc(doc(db, "nomineeGroups", id));
  },
  addGroupingAuditLog: (log: Omit<GroupingAuditLog, 'id'>) => {
    return addDoc(collection(db, "groupingAuditLogs"), log);
  },
  addMessage: (msg: Omit<Message, 'id'>) => {
    return addDoc(collection(db, "messages"), msg);
  },
  deleteMessage: (id: string) => {
    return deleteDoc(doc(db, "messages", id));
  },
  setNominee: (nominee: Nominee) => {
    // Creates or overwrites
    return setDoc(doc(db, "nominees", nominee.id), nominee);
  },
  updateNominee: (id: string, data: Partial<Nominee>) => {
    return setDoc(doc(db, "nominees", id), data, { merge: true });
  },
  deleteNominee: (id: string) => {
    return deleteDoc(doc(db, "nominees", id));
  },
  updateNomineeVotes: (id: string, votes: number) => {
    return setDoc(doc(db, "nominees", id), { votes }, { merge: true });
  },
  incrementNomineeVotes: (id: string, amount: number) => {
    return setDoc(doc(db, "nominees", id), { votes: increment(amount) }, { merge: true });
  },
  listenToAdminCredentials: (callback: (creds: any) => void) => {
    return onSnapshot(doc(db, "settings", "adminCredentials"), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        callback({ email: "admin@awol.com", password: "password123" });
      }
    });
  },
  updateAdminCredentials: (creds: any) => {
    return setDoc(doc(db, "settings", "adminCredentials"), creds, { merge: true });
  }
};
