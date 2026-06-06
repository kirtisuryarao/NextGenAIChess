export type Student = {
  id: string;
  name: string;
  avatarUrl: string;
  progress: number;
  active?: boolean;
  speaking?: boolean;
};

export const students: Student[] = [
  {
    id: "aryan",
    name: "Aryan (You)",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4tH3DJ9pwxye4nM_0-Itm1-ePzzXPa8t2LWJItbYo65X3i9AFv9ZkDMxLcbcHQdfvmt0HX8MgdClbWwnZp3ElssCsIryxq3FMhZhaQwb7wlq8jZf5rW-OzUP2-mWyRNk1xE7G22PsKTrqK_Z7CHzj8Yetl6Fy8oO2n6qMwTH_hFQES8WwdhEwS8yECXHLGzJj684l50g1Bf8tpJh3xiD4LGtLmqzQGcv2huzXQMD1nW3FKq70f3mnK-agCnVyczpSY7g6znAN_MV6",
    progress: 85,
    active: true,
    speaking: true,
  },
  {
    id: "sara",
    name: "Sara",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRRepY6fVQGxD0RP3C9C7el4JuE14syUDDUsr9-A2soeUIv8D-7GaZotIsrz7U-Jz2wFVCIuJ-zeUl5rk0VB1irDnAuZIvN-QFd8b19vCm82wMgFCbzXpEQ1wj7hdb5OaGPnJe7eMKlgsUgZjtuT54OwACtOEKUWmp3-3zDbH7b13mD9Ohf_2mGm5sE9l15tV5BFcT98Rwk99d60II0j5SYKUvkjDYrzZGJQOo41Qansnv_VvroNwuUZXCBc8Mt2cYUHaEx3u-JWSG",
    progress: 40,
  },
  {
    id: "vihaan",
    name: "Vihaan",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqzaq5vpzbrOkcG1O8AztYZGTV1Wu6rQ1AV6gtbwV3yffh3qEg9q39aVHCGsxySM1lRGmQM5w5na8MH4Nci3et8_BsK-lqBta05C-ddpMJfzDCIuOw5QDT6ZvYoY9fmECWBQ9S5LzTkievTmqrc3hc3UvSNkSM1eO8xl1KpMRbuqZLFDq1gfBgXSf9Gv4aQVh7qGLfaQhfatsIF29EbyIe3lOlnkFU52_NsX6AoKwluiOjXQgCW_6X2OzWCMTXk32mEX_lrm4P_nMP",
    progress: 62,
  },
  {
    id: "kavya",
    name: "Kavya",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBWE9YGroaCBZecZ3x1ca2QE4dOxMHO_8UAa06bMkxrNnGtXbSNs7T1BP-cR4Boxjc32NPIqwiN8bpDonr3TJ2CF7ibJo074upaoypO6MSa1IFw-5miSLvhKaQBNCBdYH_8Za91N8N5kK9XlBZQTnZR1T1rDZ_fLcBXyoZCb_hiz7tCQ1zsPwNdSqNHG_NLVtvuAKup6bMAnjHoUCSwf3eNTYxHur6f5cUDNBBWTa-UbXOZIAcPiebytYyhdR8MmlGU9DzdfHUfJ2p7",
    progress: 58,
  },
];
