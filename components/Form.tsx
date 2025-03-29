"use client";
import React, { useState } from "react";
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box } from "@mui/material";

interface FormProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (contract: {
    humanitarnaOrganizacija: string;
    ugovor: string;
    datumPocetka: string;
    datumIstekka: string;
    kratkiBroj: string;
    telefon: string;
    email: string;
    pib: string;
    racun: string;
    banka: string;
    mb: string;
  }) => void;
}

const Form: React.FC<FormProps> = ({ open, handleClose, handleSubmit }) => {
  const [humanitarnaOrganizacija, setHumanitarnaOrganizacija] = useState("");
  const [ugovor, setUgovor] = useState("");
  const [datumPocetka, setDatumPocetka] = useState("");
  const [datumIstekka, setDatumIstekka] = useState("");
  const [kratkiBroj, setKratkiBroj] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [pib, setPib] = useState("");
  const [racun, setRacun] = useState("");
  const [banka, setBanka] = useState("");
  const [mb, setMb] = useState("");

  const onSubmit = () => {
    if (
      humanitarnaOrganizacija &&
      ugovor &&
      datumPocetka &&
      datumIstekka &&
      kratkiBroj &&
      telefon &&
      email &&
      pib &&
      racun &&
      banka &&
      mb
    ) {
      handleSubmit({
        humanitarnaOrganizacija,
        ugovor,
        datumPocetka,
        datumIstekka,
        kratkiBroj,
        telefon,
        email,
        pib,
        racun,
        banka,
        mb,
      });
      // Clear the form after submission
      setHumanitarnaOrganizacija("");
      setUgovor("");
      setDatumPocetka("");
      setDatumIstekka("");
      setKratkiBroj("");
      setTelefon("");
      setEmail("");
      setPib("");
      setRacun("");
      setBanka("");
      setMb("");
      setAneks_1("");
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Unesi novu organizaciju</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Humanitarna Organizacija"
            value={humanitarnaOrganizacija}
            onChange={(e) => setHumanitarnaOrganizacija(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Broj ugovora"
            value={ugovor}
            onChange={(e) => setUgovor(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Datum početka"
            type="date"
            value={datumPocetka}
            onChange={(e) => setDatumPocetka(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Datum isteka"
            type="date"
            value={datumIstekka}
            onChange={(e) => setDatumIstekka(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Kratki broj"
            value={kratkiBroj}
            onChange={(e) => setKratkiBroj(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Telefon"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="PIB"
            value={pib}
            onChange={(e) => setPib(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Račun"
            value={racun}
            onChange={(e) => setRacun(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Bank"
            value={banka}
            onChange={(e) => setBanka(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="MB"
            value={mb}
            onChange={(e) => setMb(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Otkaži
        </Button>
        <Button onClick={onSubmit} color="primary">
          Podnesi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Form;
