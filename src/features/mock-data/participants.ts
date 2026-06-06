export type MockParticipant = {
  id: string;
  name: string;
  status: "Online" | "Away";
  isTop: boolean;
  icon: "mic2" | "hand" | null;
};

export const mockParticipants: MockParticipant[] = [
  { id: "1", name: "Vihaan (You)", status: "Online", isTop: true, icon: "mic2" },
  { id: "2", name: "Aryan", status: "Online", isTop: false, icon: null },
  { id: "3", name: "Sara", status: "Online", isTop: false, icon: "hand" },
  { id: "4", name: "Kavya", status: "Online", isTop: false, icon: null },
  { id: "5", name: "Rohan", status: "Online", isTop: false, icon: null },
  { id: "6", name: "Meera", status: "Away", isTop: false, icon: null },
];
