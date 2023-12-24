import React, { useEffect, useRef } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { TableContainer } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";
import { Step } from "./Types";

interface ScrollableTableProps {
  data: Step[];
}

const ScrollableTable: React.FC<ScrollableTableProps> = ({ data }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when new elements are added
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [data]);

  return (
    <TableContainer
      component={Paper}
      style={{
        height: window.innerWidth <= 768 ? "70vh" : "80vh",
        width: "225px",
        overflowY: "auto",
        marginLeft: "10px",
        position: "relative",
        top: 2,
      }}
      ref={tableRef}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: 20 }}>State</TableCell>
            <TableCell sx={{ fontSize: 20 }}>Node</TableCell>
            {/* Add more table headers as needed */}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((step, index) => (
            <TableRow key={index}>
              <TableCell sx={{ fontSize: 20 }}>{step.state}</TableCell>
              <TableCell sx={{ fontSize: 20 }}>{step.value}</TableCell>
              {/* Add more table cells as needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScrollableTable;
